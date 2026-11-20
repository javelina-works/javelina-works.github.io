---
enable: true # Control the visibility of this section across all pages where it is used
title: "**Contact** Javelina Works <br /> in Fort Davis, Texas"
description: "Fill out the form below, and we’ll get back to you as soon as possible. We’re committed to providing excellent customer service and addressing any inquiries you may have."

directContact:
  enable: true
  title: "Or call or email us directly"

# Check config.toml file for form action related settings (contactFormAction, contactFormProvider).
# The form is rendered by src/layouts/components/widgets/ContactForm.astro. Netlify finds it in the built HTML by its
# name ("contact-form") and stores the fields by their `name`, and netlify/functions/submission-created.mts reads
# "Full Name", "Email Address", "Contact Subject", "Message" and "User Source" by name: never rename them.
form:
  emailSubject: "New form submission from Javelina Works website" # Sent as the hidden "subject" field
  submitButton:
    enable: true
    label: "Send message"

  # Each input: label (shown above it), name (what the submission calls it), id, type (text, email, radio, checkbox),
  # tag: textarea, required, halfWidth (beside the next field on wider screens), placeholder, autocomplete,
  # error (the words shown under it when it is left empty or doesn't fit).
  # dropdown.items: one choice from a list. Up to five items show as radio rows, six or more as a select.
  # note: success | error: the words shown after sending (label is the title).
  inputs:
    - label: "Full name"
      name: "Full Name" # This is crucial. It names the field in the submission
      id: "contact-name"
      autocomplete: "name"
      required: true
      halfWidth: true
      error: "Enter your name."
    - label: "Email address"
      placeholder: "john@ranch.com"
      name: "Email Address" # This is crucial. It names the field in the submission
      id: "contact-email"
      type: "email"
      autocomplete: "email"
      required: true
      halfWidth: true
      error: "Enter your email address, like john@ranch.com."
    - label: "Why are you reaching out today?"
      name: "Contact Subject" # This is crucial. It names the field in the submission
      id: "contact-subject"
      required: false
      halfWidth: false
      dropdown:
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
      rows: "4" # Only works if tag is textarea
      placeholder: "Let us know what we can do for you"
      name: "Message" # This is crucial. It names the field in the submission
      id: "contact-message"
      required: true
      halfWidth: false
      error: "Tell us what we can do for you."

    - label: "Google Search" # only valid for type="checkbox" & type === "radio"
      id: "google-search"
      checked: false # only valid for type="checkbox" & type === "radio"
      name: "User Source" # This is crucial. It names the field in the submission
      required: true
      groupLabel: "How did you hear about us?" # Radio Inputs Label
      group: "source" # radios with the same group show together under the groupLabel
      type: "radio"
      error: "Choose how you heard about us." # the group's error (from its first radio)
    - label: "Social Media" # only valid for type="checkbox" & type === "radio"
      id: "social-media"
      name: "User Source"
      required: true
      group: "source"
      type: "radio"
    - label: "Someone I Know" # only valid for type="checkbox" & type === "radio"
      id: "someone-i-know"
      name: "User Source"
      required: true
      group: "source"
      type: "radio"

    - label: "I agree to the [terms and conditions](/terms-conditions/) and [privacy policy](/privacy-policy/)." # only valid for type="checkbox" & type === "radio"
      id: "privacy-policy"
      name: "Agreed Privacy" # This is crucial. It names the field in the submission
      value: "Agreed" # Value that will be submitted (applicable for type="checkbox" & type === "radio")
      checked: false # only valid for type="checkbox" & type === "radio"
      required: true
      type: "checkbox"
      halfWidth: false
      error: "Check the box to agree before you send."
    - note: success
      content: We have received your message. We'll get back to you as soon as possible.
    - note: error
      label: "Your message didn't send."
      content: Please email us at [info@javelinaworks.com](mailto:info@javelinaworks.com) or call [432-203-5975](tel:+14322035975).
---
