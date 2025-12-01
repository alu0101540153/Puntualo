import { FollowRequestModel } from '../models'
import { NotificationModel } from '../models'
import { UserModel } from '../models'
import mongoose from 'mongoose'

export const followRequestService = {
  // Crear una solicitud de seguimiento
  create: async (fromId: string, toId: string) => {
    // Verificar que el usuario destino existe
    const targetUser = await UserModel.findById(toId)
    if (!targetUser) {
      throw new Error('Usuario no encontrado')
    }

    // Si la cuenta es pública, seguir directamente
    if (!targetUser.isPrivate) {
      // Añadir a following del usuario que sigue
      await UserModel.findByIdAndUpdate(
        fromId,
        { $addToSet: { following: toId } },
        { new: true }
      )
      
      // Añadir a followers del usuario seguido
      await UserModel.findByIdAndUpdate(
        toId,
        { $addToSet: { followers: fromId } },
        { new: true }
      )

      return { message: 'Ahora sigues a este usuario', status: 'following' }
    }

    // Si la cuenta es privada, verificar si ya existe una solicitud
    const existingRequest = await FollowRequestModel.findOne({
      from: fromId,
      to: toId,
      status: 'pending'
    })

    if (existingRequest) {
      return { message: 'Ya has enviado una solicitud a este usuario', status: 'requested', request: existingRequest }
    }

    // Crear la solicitud
    const request = await FollowRequestModel.create({
      from: fromId,
      to: toId,
      status: 'pending'
    })

    // Obtener información del remitente para la notificación
    const fromUser = await UserModel.findById(fromId).select('name handle')

    // Crear notificación para el destinatario
    await NotificationModel.create({
      recipient: toId,
      sender: fromId,
      type: 'follow_request',
      message: `${fromUser?.name || 'Alguien'} quiere seguirte`,
      relatedId: request._id
    })

    return { message: 'Solicitud enviada', status: 'requested', request }
  },

  // Aceptar una solicitud de seguimiento
  accept: async (requestId: string, userId: string) => {
    const request = await FollowRequestModel.findById(requestId)
    
    if (!request) {
      throw new Error('Solicitud no encontrada')
    }

    // Verificar que el usuario es el destinatario
    if (request.to.toString() !== userId) {
      throw new Error('No tienes permiso para aceptar esta solicitud')
    }

    if (request.status !== 'pending') {
      throw new Error('Esta solicitud ya ha sido procesada')
    }

    // Actualizar la solicitud
    request.status = 'accepted'
    await request.save()

    // Añadir a following del usuario que solicitó
    await UserModel.findByIdAndUpdate(
      request.from,
      { $addToSet: { following: request.to } },
      { new: true }
    )

    // Añadir a followers del usuario que aceptó
    await UserModel.findByIdAndUpdate(
      request.to,
      { $addToSet: { followers: request.from } },
      { new: true }
    )

    // Obtener información de ambos usuarios
    const toUser = await UserModel.findById(request.to).select('name handle')
    const fromUser = await UserModel.findById(request.from).select('name handle')

    // Crear notificación para el que envió la solicitud (ahora puede ver el perfil)
    await NotificationModel.create({
      recipient: request.from,
      sender: request.to,
      type: 'follow_accepted',
      message: `${toUser?.name || 'Alguien'} aceptó tu solicitud`,
      relatedId: request._id
    })

    // Crear notificación para el que aceptó (nuevo seguidor)
    await NotificationModel.create({
      recipient: request.to,
      sender: request.from,
      type: 'follow_accepted',
      message: `${fromUser?.name || 'Alguien'} ha empezado a seguirte`,
      relatedId: request._id
    })

    return { message: 'Solicitud aceptada', request }
  },

  // Rechazar una solicitud de seguimiento
  reject: async (requestId: string, userId: string) => {
    const request = await FollowRequestModel.findById(requestId)
    
    if (!request) {
      throw new Error('Solicitud no encontrada')
    }

    // Verificar que el usuario es el destinatario
    if (request.to.toString() !== userId) {
      throw new Error('No tienes permiso para rechazar esta solicitud')
    }

    if (request.status !== 'pending') {
      throw new Error('Esta solicitud ya ha sido procesada')
    }

    // Actualizar la solicitud
    request.status = 'rejected'
    await request.save()

    return { message: 'Solicitud rechazada', request }
  },

  // Obtener solicitudes pendientes de un usuario
  getPendingRequests: async (userId: string) => {
    const requests = await FollowRequestModel.find({
      to: userId,
      status: 'pending'
    })
      .populate('from', 'name handle avatarBgColor')
      .sort({ createdAt: -1 })
      .lean()

    return requests
  },

  // Obtener solicitudes enviadas por un usuario
  getSentRequests: async (userId: string) => {
    const requests = await FollowRequestModel.find({
      from: userId,
      status: 'pending'
    })
      .populate('to', 'name handle avatarBgColor')
      .sort({ createdAt: -1 })
      .lean()

    return requests
  },

  // Verificar si existe una solicitud pendiente
  checkPendingRequest: async (fromId: string, toId: string) => {
    const request = await FollowRequestModel.findOne({
      from: fromId,
      to: toId,
      status: 'pending'
    })

    return !!request
  },

  // Cancelar una solicitud enviada
  cancel: async (requestId: string, userId: string) => {
    const request = await FollowRequestModel.findById(requestId)
    
    if (!request) {
      throw new Error('Solicitud no encontrada')
    }

    // Verificar que el usuario es el remitente
    if (request.from.toString() !== userId) {
      throw new Error('No tienes permiso para cancelar esta solicitud')
    }

    if (request.status !== 'pending') {
      throw new Error('Esta solicitud ya ha sido procesada')
    }

    // Eliminar la solicitud y la notificación relacionada
    await FollowRequestModel.findByIdAndDelete(requestId)
    await NotificationModel.deleteMany({ relatedId: requestId })

    return { message: 'Solicitud cancelada' }
  }
}
