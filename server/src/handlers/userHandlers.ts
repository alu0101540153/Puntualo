import { Request, Response }  from 'express'
import { validationResult } from "express-validator"
import slug from 'slug'
import formidable from 'formidable'
import { v4 as uuid} from 'uuid'
import User from "../models/User"
import UserBook from "../models/UserBook";
import { checkPassword, hashPassword } from '../utils/auth'
import { generateJWT } from '../utils/jwt'


export const createAccount = async (req: Request, res: Response) => {

    const { email, password} = req.body

    // find one is like a where in SQL
    const userExists = await User.findOne({email})
    if(userExists) {
        const error = new Error('El usuario ya está registrado')
        return res.status(409).json({error : error.message})
    }

    const handle = slug(req.body.handle, '')

    const handleExists = await User.findOne({handle})
    if(handleExists) {
        const error = new Error('Nombre de usuario no disponible')
        return res.status(409).json({error : error.message})
    }

    const user = new User(req.body)
    user.password = await hashPassword(password)
    user.handle = handle

    await user.save()
    res.status(201).send("registro creado correctamente")
}

export const login = async (req: Request,  res: Response) => {

    

    const { email, password} = req.body

    // buscar si el usuario existe o no  en el registro
    const user = await User.findOne({email})
    if(!user) {
        const error = new Error('No existe un usuario registrado con ese email')
        return res.status(404).json({error : error.message})
    }

    // validar la contraseña
    const isPasswordCorrect = await checkPassword(password, user.password)
    if(!isPasswordCorrect){
        const error = new Error('Contraseña incorrecta')
        return res.status(401).json({error : error.message})
    }

    const token = generateJWT({id: user._id})

    res.send(token)
}


export const getUser = async (req: Request, res: Response) => {
    res.json(req.user)
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { description, links, name } = req.body
        const handle = slug(req.body.handle, '')
        const handleExists = await User.findOne({handle})
        if(handleExists && handleExists.email !== req.user.email) {
            const error = new Error('handle no disponible')
            return res.status(409).json({error : error.message})
        }
        // update the user
        req.user.description = description
        req.user.handle = handle
        req.user.name = name

        await req.user.save()
        res.send("Perfil actualizado correctamente")


    } catch (e) {
        const error = new Error('Error al actualizar el perfil')
        return res.status(500).json({error : error.message})
    }
}

export const getUserByHandle = async (req: Request, res: Response) => {
    try {
        const { handle } = req.params
        const user = await User.findOne({handle}).select('-password -__v -_id -email') // es como aplicar un where en SQL
        if(!user) {
            const error = new Error('Usuario no encontrado__')
            return res.status(404).json({error : error.message})
        }
        res.json(user)
    } catch (e) {
        const error = new Error('hubo un error')
        return res.status(500).json({error : error.message})
    }
}

export const searchByHandle = async (req: Request, res: Response) => {
    try {
        const { handle } = req.body
        const userExists = await User.findOne({handle})
        if(userExists) {
            const error = new Error(`${handle} ya está registrado`)
            return res.status(409).json({error : error.message})
        }
        res.send(`${handle} está disponible.`)
    } catch (e) {
        const error = new Error('Error al obtener el usuario')
        return res.status(500).json({error : error.message})
    }
}

export const followUser = async (req: Request, res: Response) => {
    try {
        const { handle } = req.body
        const userToFollow= await User.findOne({ handle })
        if (!userToFollow) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }

        // verify that the user was not followed yet
        if (req.user.follows.includes(userToFollow._id.toString())) {
            const error = new Error('Ya sigues a este usuario')
            console.log("User already followed:", userToFollow._id.toString());
            return res.status(409).json({ error: error.message })
        }

        req.user.follows.push(userToFollow._id.toString())
        await req.user.save()
        console.log("User follows updated:", req.user.follows);

        // send a json with the response
        res.json({ message: "Ahora sigues a " + handle })
    } catch (e) {
        const error = new Error('Error al seguir al usuario')
        return res.status(500).json({ error: error.message })
    }
}

export const unfollowUser = async (req: Request, res: Response) => {
    try {
        const { handle } = req.body
        const userToUnfollow = await User.findOne({ handle })
        if (!userToUnfollow) {
            const error = new Error('Usuario no encontrado_a')
            return res.status(404).json({ error: error.message })
        }

        req.user.follows = req.user.follows.filter(followId => followId.toString() !== userToUnfollow._id.toString())
        await req.user.save()
        console.log("User unfollowed:", userToUnfollow._id.toString());
        // return a json with the response
        res.json({ message: "Dejaste de seguir a " + handle })
    } catch (e) {
        const error = new Error('Error al dejar de seguir al usuario')
        return res.status(500).json({ error: error.message })
    }
}

// Load a feed for the user follows
export const loadFeed = async (req: Request, res: Response) => {
    console.log("Loading feed for user:");
    try {

        // Obtén los IDs de los usuarios seguidos
        const followedIds = req.user.follows;
        console.log("Followed IDs:", followedIds);
        // if its empty return a message
        if (!followedIds || followedIds.length === 0) {
            return res.json({ message: "No sigues a ningún usuario." });
        }

        // Carga el último libro de cada usuario seguido
        const feed = await UserBook.find({ userId: { $in: followedIds } })
            .sort({ createdAt: -1 }) // Ordena por fecha de creación, el más reciente primero
            .limit(20) // Limita a los 20 libros más recientes
            .populate('userId', 'handle name') // Popula el campo userId con handle y name
            .exec();

        res.json(feed);

    } catch (e) {
        const error = new Error('Error al cargar el feed');
        return res.status(500).json({ error: error.message });
    }
};
