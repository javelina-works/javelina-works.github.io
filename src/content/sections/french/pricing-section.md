---
enable: true # Contrôlez la visibilité de cette section sur toutes les pages où elle est utilisée
title: "**Choisissez le plan** qui vous convient le mieux"
priceComparisonTitle: "Vous hésitez entre plusieurs plans ? **Comparons**"

plans:
  enable: true
  list:
    - selected: true
      label: Par Mois
    - selected: false
      label: Par An

list:
  - enable: true
    featured: false
    badge:
      enable: false
      label: Meilleur Rapport Qualité/Prix
    name: Plan Starter
    description: Parfait pour les startups et petites équipes qui débutent.

    price:
      - type: Par Mois
        prependValue: €
        value: 29
        appendValue:
      - type: Par An
        prependValue: €
        value: 290
        appendValue:

    button:
      enable: true
      label: Commencer l'essai gratuit
      url: /contact/?plan=starter
      hoverEffect: "text-flip"

  - enable: true
    featured: true
    badge:
      enable: true
      label: Le plus populaire
    name: Plan Growth
    description: Idéal pour les entreprises en croissance nécessitant des fonctionnalités avancées.

    price:
      - type: Par Mois
        prependValue: €
        value: 79
        appendValue:
      - type: Par An
        prependValue: €
        value: 790
        appendValue:

    button:
      enable: true
      label: Commencer l'essai gratuit
      url: /contact/?plan=growth
      hoverEffect: "text-flip"

  - enable: true
    featured: false
    badge:
      enable: false
      label: Entreprise
    name: Plan Enterprise
    description: Solution complète pour les grandes organisations.

    price:
      - type: Par Mois
        prependValue: €
        value: 199
        appendValue:
      - type: Par An
        prependValue: €
        value: 1990
        appendValue:

    button:
      enable: true
      label: Contacter les ventes
      url: /contact/?plan=enterprise
      hoverEffect: "text-flip"

comparison:
  - label: Fonctionnalités principales
    list:
      - value: Membres de l'équipe
        showInCard: true
        included:
          - "Jusqu'à 5 utilisateurs"
          - "Jusqu'à 25 utilisateurs"
          - "Utilisateurs illimités"
      - value: Espace de stockage
        showInCard: true
        included:
          - "10Go"
          - "100Go"
          - "Illimité"
      - value: Appels API par mois
        showInCard: true
        included:
          - "1 000 appels"
          - "10 000 appels"
          - "Illimité"
      - value: Accès à l'application mobile
        showInCard: true
        included:
          - true
          - true
          - true

  - label: Analyse et rapports
    list:
      - value: Analytique de base
        showInCard: true
        included:
          - true
          - true
          - true
      - value: Rapports avancés
        showInCard: true
        included:
          - false
          - true
          - true
      - value: Créateur de tableau de bord personnalisé
        showInCard: true
        included:
          - false
          - true
          - true
      - value: Rapports entreprise
        showInCard: true
        included:
          - false
          - false
          - true

  - label: Intégrations et automatisation
    list:
      - value: Intégrations standards
        showInCard: true
        included:
          - "10+ intégrations"
          - "50+ intégrations"
          - "Intégrations personnalisées"
      - value: Flux de travail automatisés
        showInCard: false
        included:
          - false
          - true
          - true
      - value: Tests A/B
        showInCard: false
        included:
          - false
          - true
          - true
      - value: Développement personnalisé
        showInCard: false
        included:
          - false
          - false
          - true

  - label: Support et sécurité
    list:
      - value: Support par email
        showInCard: false
        included:
          - "Réponse 24-48h"
          - "Réponse 4-8h"
          - "Réponse 1h"
      - value: Support prioritaire
        showInCard: false
        included:
          - false
          - true
          - true
      - value: Gestionnaire de compte dédié
        showInCard: false
        included:
          - false
          - false
          - true
      - value: Sécurité entreprise (SSO/SAML)
        showInCard: false
        included:
          - false
          - false
          - true
      - value: Garantie SLA
        showInCard: false
        included:
          - false
          - false
          - "99,9% disponibilité"
      - value: Conformité (SOC2, RGPD)
        showInCard: false
        included:
          - false
          - false
          - true

  - label: Personnalisation et marque
    list:
      - value: Options en marque blanche
        showInCard: false
        included:
          - false
          - "Marque de base"
          - "Marque complète"
      - value: Onboarding personnalisé
        showInCard: false
        included:
          - false
          - false
          - true
      - value: Formation et ateliers
        showInCard: false
        included:
          - false
          - "Libre-service"
          - "Formation dédiée"
---
