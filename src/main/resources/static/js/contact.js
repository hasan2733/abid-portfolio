(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  if (!form) return;

  const submitBtn = document.getElementById("submit-btn");
  const btnText = submitBtn?.querySelector(".btn__text");
  const btnLoading = submitBtn?.querySelector(".btn__loading");
  const formStatus = document.getElementById("form-status");

  const fields = {
    name: {
      input: document.getElementById("name"),
      error: document.getElementById("error-name"),
    },
    email: {
      input: document.getElementById("email"),
      error: document.getElementById("error-email"),
    },
    message: {
      input: document.getElementById("message"),
      error: document.getElementById("error-message"),
    },
  };

  function clearErrors() {
    Object.values(fields).forEach(function (field) {
      if (field.input) field.input.classList.remove("is-invalid");
      if (field.error) field.error.textContent = "";
    });
    if (formStatus) {
      formStatus.textContent = "";
      formStatus.className = "form-status";
    }
  }

  function setFieldError(key, message) {
    const field = fields[key];
    if (field?.input) field.input.classList.add("is-invalid");
    if (field?.error) field.error.textContent = message;
  }

  function validateClient() {
    clearErrors();
    let valid = true;

    const name = fields.name.input?.value.trim() || "";
    const email = fields.email.input?.value.trim() || "";
    const message = fields.message.input?.value.trim() || "";

    if (!name) {
      setFieldError("name", "Name is required.");
      valid = false;
    } else if (name.length > 100) {
      setFieldError("name", "Name must be at most 100 characters.");
      valid = false;
    }

    if (!email) {
      setFieldError("email", "Email is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("email", "Please enter a valid email address.");
      valid = false;
    }

    if (!message) {
      setFieldError("message", "Message is required.");
      valid = false;
    } else if (message.length > 2000) {
      setFieldError("message", "Message must be at most 2000 characters.");
      valid = false;
    }

    return valid;
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (btnText) btnText.hidden = loading;
    if (btnLoading) btnLoading.hidden = !loading;
  }

  function showStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = "form-status is-" + type;
  }

  function encodeFormBody(data) {
    const params = new URLSearchParams();
    Object.keys(data).forEach(function (key) {
      params.append(key, data[key]);
    });
    return params.toString();
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!validateClient()) return;

    const payload = {
      "form-name": "contact",
      name: fields.name.input.value.trim(),
      email: fields.email.input.value.trim(),
      message: fields.message.input.value.trim(),
    };

    setLoading(true);
    clearErrors();

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeFormBody(payload),
      });

      if (response.ok) {
        showStatus(
          "Thank you! Your message has been sent successfully.",
          "success"
        );
        form.reset();
      } else {
        showStatus(
          "Unable to send your message. Please try again later or email me directly.",
          "error"
        );
      }
    } catch (err) {
      showStatus(
        "Network error. On local preview, forms work after deploy to Netlify. You can also email me directly.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  });

  Object.values(fields).forEach(function (field) {
    field.input?.addEventListener("input", function () {
      field.input.classList.remove("is-invalid");
      if (field.error) field.error.textContent = "";
    });
  });
})();
