---
enable: true # Control the visibility of this section across all pages where it is used
title: "**Choose the Plan** That Fits You Best"
priceComparisonTitle: "Not Sure Which Plan? **Let’s Compare**"

plans:
  enable: true
  list:
    # List of available plans. Ensure that these names are used consistently in other places where applicable.
    - selected: true
      label: Per Month # Use this value exactly in all corresponding places below.
    - selected: false
      label: Per Year # Use this value exactly in all corresponding places below.

list:
  # Starter Plan
  - enable: true
    featured: false
    badge:
      enable: false
      label: Best Value
    name: Starter Plan # Name of the pricing tier.
    description: Perfect for startups and small teams getting started.

    price:
      # Pricing details for each plan type.
      - type: Per Month # Plan type (must match values in the 'plans' section above).
        prependValue: $
        value: 29
        appendValue:
      - type: Per Year # Plan type (must match values in the 'plans' section above).
        prependValue: $
        value: 290
        appendValue:

    button:
      enable: true
      label: Start Free Trial
      url: /contact/?plan=starterb
      rel:
      target:
      variant: "outline" # "fill", "outline", "text"
      hoverEffect: "text-flip" # "text-flip", "creative-fill", "magnetic", "magnetic-text-flip"

  # Growth Plan
  - enable: true
    featured: true
    badge:
      enable: true
      label: Most Popular
    name: Growth Plan # Name of the pricing tier.
    description: Ideal for growing businesses that need advanced features.

    price:
      # Pricing details for each plan type.
      - type: Per Month # Plan type (must match values in the 'plans' section above).
        prependValue: $
        value: 79
        appendValue:
      - type: Per Year # Plan type (must match values in the 'plans' section above).
        prependValue: $
        value: 790
        appendValue:

    button:
      enable: true
      label: Start Free Trial
      url: /contact/?plan=growth
      rel:
      target:
      variant: "fill" # "fill", "outline", "text"
      hoverEffect: "text-flip" # "text-flip", "creative-fill", "magnetic", "magnetic-text-flip"

  # Enterprise Plan
  - enable: true
    featured: false
    badge:
      enable: false
      label: Enterprise
    name: Enterprise Plan # Name of the pricing tier.
    description: Comprehensive solution for large organizations.

    price:
      # Pricing details for each plan type.
      - type: Per Month # Plan type (must match values in the 'plans' section above).
        prependValue: $
        value: 199
        appendValue:
      - type: Per Year # Plan type (must match values in the 'plans' section above).
        prependValue: $
        value: 1990
        appendValue:

    button:
      enable: true
      label: Contact Sales
      url: /contact/?plan=enterprise
      rel:
      target:
      variant: "outline" # "fill", "outline", "text"
      hoverEffect: "text-flip" # "text-flip", "creative-fill", "magnetic", "magnetic-text-flip"

# Pricing Comparison & Features
comparison:
  - label: Core Features
    list:
      - value: Team Members
        showInCard: true
        included:
          - "Up to 5 users" # Starter Plan
          - "Up to 25 users" # Growth Plan
          - "Unlimited users" # Enterprise Plan
      - value: Storage Space
        showInCard: true
        included:
          - "10GB" # Starter Plan
          - "100GB" # Growth Plan
          - "Unlimited" # Enterprise Plan
      - value: API Calls per Month
        showInCard: true
        included:
          - "1,000 calls" # Starter Plan
          - "10,000 calls" # Growth Plan
          - "Unlimited" # Enterprise Plan
      - value: Mobile App Access
        showInCard: true
        included:
          - true # Starter Plan
          - true # Growth Plan
          - true # Enterprise Plan

  - label: Analytics and Reporting
    list:
      - value: Basic Analytics
        showInCard: true
        included:
          - true # Starter Plan
          - true # Growth Plan
          - true # Enterprise Plan
      - value: Advanced Reports
        showInCard: true
        included:
          - false # Starter Plan
          - true # Growth Plan
          - true # Enterprise Plan
      - value: Custom Dashboard Builder
        showInCard: true
        included:
          - false # Starter Plan
          - true # Growth Plan
          - true # Enterprise Plan
      - value: Enterprise Reporting
        showInCard: true
        included:
          - false # Starter Plan
          - false # Growth Plan
          - true # Enterprise Plan

  - label: Integrations and Automation
    list:
      - value: Standard Integrations
        showInCard: true
        included:
          - "10+ integrations" # Starter Plan
          - "50+ integrations" # Growth Plan
          - "Custom integrations" # Enterprise Plan
      - value: Automation Workflows
        showInCard: false
        included:
          - false # Starter Plan
          - true # Growth Plan
          - true # Enterprise Plan
      - value: A/B Testing
        showInCard: false
        included:
          - false # Starter Plan
          - true # Growth Plan
          - true # Enterprise Plan
      - value: Custom Development
        showInCard: false
        included:
          - false # Starter Plan
          - false # Growth Plan
          - true # Enterprise Plan

  - label: Support and Security
    list:
      - value: Email Support
        showInCard: false
        included:
          - "24-48h response" # Starter Plan
          - "4-8h response" # Growth Plan
          - "1h response" # Enterprise Plan
      - value: Priority Support
        showInCard: false
        included:
          - false # Starter Plan
          - true # Growth Plan
          - true # Enterprise Plan
      - value: Dedicated Account Manager
        showInCard: false
        included:
          - false # Starter Plan
          - false # Growth Plan
          - true # Enterprise Plan
      - value: Enterprise Security (SSO/SAML)
        showInCard: false
        included:
          - false # Starter Plan
          - false # Growth Plan
          - true # Enterprise Plan
      - value: SLA Guarantee
        showInCard: false
        included:
          - false # Starter Plan
          - false # Growth Plan
          - "99.9% uptime" # Enterprise Plan
      - value: Compliance (SOC2, GDPR)
        showInCard: false
        included:
          - false # Starter Plan
          - false # Growth Plan
          - true # Enterprise Plan

  - label: Customization and Branding
    list:
      - value: White-label Options
        showInCard: false
        included:
          - false # Starter Plan
          - "Basic branding" # Growth Plan
          - "Full white-label" # Enterprise Plan
      - value: Custom Onboarding
        showInCard: false
        included:
          - false # Starter Plan
          - false # Growth Plan
          - true # Enterprise Plan
      - value: Training and Workshops
        showInCard: false
        included:
          - false # Starter Plan
          - "Self-service" # Growth Plan
          - "Dedicated training" # Enterprise Plan
---
