---
enable: true # Control the visibility of this section across all pages where it is used
title: "**Have questions?** <br /> We'd love to hear from you"
description: "Fill out the form below, and we’ll get back to you as soon as possible. We’re committed to providing excellent customer service and addressing any inquiries you may have."

# testimonial:
#   enable: false
#   content: "Our remote collaboration improved drastically, saving countless hours every single week"
#   customer:
#     avatar: /images/customers/avatar/1.jpg
#     name: kowsi Han
#     role: Marketing Director

# Check config.toml file for form action related settings
# this is also used in the footer of the personal portfolio homepage
form:
  emailSubject: "New form submission from folex website" # Customized email subject (applicable when anyone submit form, form submission may receive by email depend on provider)
  submitButton:
    # Refer to the `sharedButton` schema in `src/sections.schema.ts` for all available configuration options (e.g., enable, label, url, hoverEffect, variant, icon, tag, rel, class, target, etc.)
    enable: true
    label: "SEND MESSAGE"
    # hoverEffect: "" # Optional: text-flip | creative-fill | magnetic | magnetic-text-flip
    # variant: "" # Optional: fill | outline | text
    # rel: "" # Optional
    # target: "" # Optional

  # This note will show at the end of form
  # note: |
  #   Your data is safe with us. We respect your privacy and never share your information. <br /> Read our [Privacy Policy](/privacy-policy/).
  inputs:
    - label: ""
      placeholder: "John *"
      name: "Full Name" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      halfWidth: true
      defaultValue: ""
    - label: ""
      placeholder: "Javelina *"
      name: "Full Name" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      halfWidth: true
      defaultValue: ""
    - label: ""
      placeholder: "john@ranch.com *"
      name: "Email Address" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      type: "email"
      halfWidth: false
      defaultValue: ""
    - label: "Why are you reaching out today?"
      placeholder: "To what do we owe the pleasure?"
      name: "Contact Subject" # This is crucial. Its indicate under which name you want to receive this field data
      required: false
      halfWidth: false
      dropdown:
        type: "search" # select | search - default is select
        search: # if type is search then it will work
          placeholder: "Reason for Outreach"
        items:
          - label: "Services and Quotes"
            value: "Services and Quotes"
            selected: true
          - label: "General Inquiry"
            value: "General Inquiry"
            selected: false
          - label: "Partnership"
            value: "Partnership"
            selected: false
          - label: "Support"
            value: "Support"
            selected: false
          # - label: "Investment"
          #   value: "Investment"
          #   selected: false
          # - label: "Media Inquiry"
          #   value: "Media Inquiry"
          #   selected: false
    - label: "What can we do for you?"
      tag: "textarea"
      defaultValue: ""
      rows: "2" # Only work if tag is textarea
      placeholder: "Let us know what we can do for you *"
      name: "Message" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      halfWidth: false

    - label: "Google Search" # only valid for type="checkbox" & type === "radio"
      checked: false # only valid for type="checkbox" & type === "radio"
      name: "User Source" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      groupLabel: "How did you hear about us?" # Radio Inputs Label
      group: "source" # when you add group then it will omit space between the same group radio input
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "Social Media" # only valid for type="checkbox" & type === "radio"
      name: "User Source" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      groupLabel: "" # Radio Inputs Label
      group: "source" # when you add group then it will omit space between the same group radio input
      type: "radio"
      halfWidth: true
      defaultValue: ""
    - label: "Someone I Know" # only valid for type="checkbox" & type === "radio"
      name: "User Source" # This is crucial. Its indicate under which name you want to receive this field data
      required: true
      groupLabel: "" # Radio Inputs Label
      group: "source" # when you add group then it will omit space between the same group radio input
      type: "radio"
      halfWidth: true
      defaultValue: ""

    - label: "I agree to the terms and conditions and [privacy policy](/contact/)." # only valid for type="checkbox" & type === "radio"
      id: "privacy-policy"
      name: "Agreed Privacy" # This is crucial. Its indicate under which name you want to receive this field data
      value: "Agreed" # Value that will be submit (applicable for type="checkbox" & type === "radio")
      checked: false # only valid for type="checkbox" & type === "radio"
      required: true
      type: "checkbox"
      halfWidth: false
      defaultValue: ""
    - note: success # info | warning | success | deprecated | hint
      parentClass: "hidden text-sm message success"
      content: We have received your message! We'll get back to you as soon as possible.
    - note: deprecated # info | warning | success | deprecated | hint
      parentClass: "hidden text-sm message error"
      content: Something went wrong! please use this mail - [contact@javelinaworks.com](mailto:contact@javelinaworks.com) to get in touch!
---
