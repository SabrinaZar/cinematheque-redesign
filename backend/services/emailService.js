
const nodemailer = require("nodemailer");

// Envoyer un email après acceptation du compte
async function envoyerEmailAcceptation(user) {

  // Configuration du serveur email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Contenu de l'email
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: user.email,

    subject: "Votre compte Cinémathèque a été accepté 🎬",

    text: `
Bonjour ${user.nom},

Bonne nouvelle !

Votre compte Cinémathèque a été accepté
par notre administrateur.

Vous pouvez maintenant vous connecter
et commencer à créer votre collection de films.

Bienvenue sur Cinémathèque !

L'équipe Cinémathèque
    `
  });
}


async function envoyerEmailVerification(user, lien) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: user.email,
    subject: "Vérifiez votre adresse email - Cinémathèque",
    text: `
Bonjour ${user.nom},

Bienvenue sur Cinémathèque !

Pour confirmer votre adresse email, cliquez sur ce lien :

${lien}

Ce lien est valable pendant 24 heures.

Après vérification, votre compte restera en attente
de validation par l'administrateur.

L'équipe Cinémathèque
    `
  });
}


module.exports = {
  envoyerEmailAcceptation,
  envoyerEmailVerification
};
