---
enable: true # Contrôle la visibilité de cette section sur toutes les pages où elle est utilisée
title: "**Des questions ?** <br /> Envoyez-nous un message"
description: "Remplissez le formulaire ci-dessous et nous vous répondrons dès que possible. Nous nous engageons à fournir un excellent service client et à répondre à toutes vos demandes."

testimonial:
  enable: true
  content: "Notre collaboration à distance s'est considérablement améliorée, économisant d'innombrables heures chaque semaine"
  customer:
    avatar: /images/customers/avatar/1.jpg
    name: kowsi Han
    role: Directeur Marketing

social:
  enable: true
  title: "Suivez-nous sur les réseaux sociaux"
  # décommentez la liste ci-dessous si vous voulez remplacer les données de `src/config/social.json`
  # list:
  #   - enable: true
  #     label: "facebook"
  #     icon: "/images/icons/svg/facebook.svg"
  #     url: "/"

# Vérifiez le fichier config.toml pour les paramètres liés au formulaire
# Ceci est également utilisé dans le pied de page de la page d'accueil du portfolio personnel
form:
  emailSubject: "Nouvelle soumission de formulaire depuis le site folex" # Objet de l'email personnalisé (applicable lorsqu'une personne soumet le formulaire)
  submitButton:
    enable: true
    label: "ENVOYER LE MESSAGE"
    # hoverEffect: "" # Optionnel : text-flip | creative-fill | magnetic | magnetic-text-flip
    # variant: "" # Optionnel : fill | outline | text
    # rel: "" # Optionnel
    # target: "" # Optionnel

  inputs:
    - label: ""
      placeholder: "John *"
      name: "Nom complet"
      required: true
      halfWidth: true
      defaultValue: ""
    - label: ""
      placeholder: "Doe *"
      name: "Nom complet"
      required: true
      halfWidth: true
      defaultValue: ""
    - label: ""
      placeholder: "john@ko.eoo *"
      name: "Adresse email"
      required: true
      type: "email"
      halfWidth: false
      defaultValue: ""
    - label: ""
      placeholder: "Sujet *"
      name: "Sujet"
      required: false
      halfWidth: true
      dropdown:
        type: ""
        search:
          placeholder: ""
        items:
          - label: "Demande générale"
            value: "Demande générale"
            selected: false
          - label: "Partenariat"
            value: "Partenariat"
            selected: false
          - label: "Investissement"
            value: "Investissement"
            selected: false
    - label: ""
      placeholder: "Sujet avec recherche *"
      name: "Sujet avec recherche"
      required: false
      halfWidth: true
      dropdown:
        type: "search"
        search:
          placeholder: "Sujet avec recherche"
        items:
          - label: "Demande générale"
            value: "Demande générale"
            selected: false
          - label: "Partenariat"
            value: "Partenariat"
            selected: false
          - label: "Carrière"
            value: "Carrière"
            selected: false
          - label: "Investissement"
            value: "Investissement"
            selected: false
          - label: "Demande média"
            value: "Demande média"
            selected: false
    - label: ""
      tag: "textarea"
      defaultValue: ""
      rows: "2"
      placeholder: "Comment pouvons-nous vous aider *"
      name: "Message"
      required: true
      halfWidth: false
    - label: "Recherche Google"
      checked: false
      name: "Source utilisateur"
      required: true
      groupLabel: "Comment avez-vous entendu parler de nous ?"
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "Réseaux sociaux"
      name: "Source utilisateur"
      required: true
      groupLabel: ""
      group: "source"
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "J'accepte les termes et conditions et la [politique de confidentialité](/contact/)."
      id: "privacy-policy"
      name: "Consentement vie privée"
      value: "Consentement"
      checked: false
      required: true
      type: "checkbox"
      halfWidth: false
      defaultValue: ""
    - note: success
      parentClass: "hidden text-sm message success"
      content: "Nous avons reçu votre message ! Nous vous répondrons dès que possible."
    - note: deprecated
      parentClass: "hidden text-sm message error"
      content: "Une erreur est survenue ! veuillez utiliser ce mail - [folex-astro-theme@gmail.com](mailto:folex-astro-theme@gmail.com) pour soumettre un ticket !"
---
