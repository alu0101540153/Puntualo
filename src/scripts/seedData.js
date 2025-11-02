const { connectDB, getDB } = require('../config/database');
const Content = require('../models/Content');

const seedData = async () => {
  try {
    await connectDB();
    const contentModel = new Content();

    const sampleContent = [
      {
        title: "El Señor de los Anillos: La Comunidad del Anillo",
        type: "movie",
        genre: ["fantasía", "aventura", "acción"],
        description: "Un hobbit llamado Frodo Bolsón hereda un anillo mágico que debe ser destruido antes de que caiga en manos del Señor Oscuro Sauron.",
        releaseDate: new Date("2001-12-19"),
        director: "Peter Jackson",
        duration: 178,
        coverImage: "/covers/lotr.jpg"
      },
      {
        title: "Juego de Tronos",
        type: "series",
        genre: ["fantasía", "drama", "aventura"],
        description: "Nobles familias luchan por el control del Trono de Hierro en los Siete Reinos de Westeros.",
        releaseDate: new Date("2011-04-17"),
        director: "Varios",
        seasons: 8,
        coverImage: "/covers/got.jpg"
      },
      {
        title: "1984",
        type: "book",
        genre: ["distopía", "ciencia ficción", "política"],
        description: "Una novela distópica sobre un régimen totalitario y la vigilancia masiva.",
        author: "George Orwell",
        pages: 328,
        isbn: "978-0451524935",
        coverImage: "/covers/1984.jpg"
      },
      {
        title: "Breaking Bad",
        type: "series", 
        genre: ["drama", "crimen", "thriller"],
        description: "Un profesor de química con cáncer se convierte en fabricante de metanfetaminas.",
        releaseDate: new Date("2008-01-20"),
        director: "Vince Gilligan",
        seasons: 5,
        coverImage: "/covers/breaking-bad.jpg"
      },
      {
        title: "Cien años de soledad",
        type: "book",
        genre: ["realismo mágico", "ficción"],
        description: "La historia de la familia Buendía en el pueblo ficticio de Macondo.",
        author: "Gabriel García Márquez", 
        pages: 417,
        isbn: "978-0307474728",
        coverImage: "/covers/cien-anios.jpg"
      }
    ];

    console.log("🌱 Insertando datos de ejemplo...");
    
    for (const content of sampleContent) {
      await contentModel.create(content);
      console.log(`Creado: ${content.title}`);
    }

    console.log("🎉 Datos de ejemplo insertados correctamente");
    process.exit(0);
  } catch (error) {
    console.error("Error insertando datos:", error);
    process.exit(1);
  }
};

seedData();