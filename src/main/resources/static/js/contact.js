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

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!validateClient()) return;

    const payload = {
      name: fields.name.input.value.trim(),
      email: fields.email.input.value.trim(),
      message: fields.message.input.value.trim(),
    };

    setLoading(true);
    clearErrors();

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(function () {
        return {};
      });

      if (response.ok && data.success) {
        showStatus(
          data.message || "Thank you! Your message has been sent.",
          "success"
        );
        form.reset();
      } else if (response.status === 400 && data.errors) {
        data.errors.forEach(function (err) {
          const lower = err.toLowerCase();
          if (lower.startsWith("name:")) {
            setFieldError("name", err.replace(/^name:\s*/i, ""));
          } else if (lower.startsWith("email:")) {
            setFieldError("email", err.replace(/^email:\s*/i, ""));
          } else if (lower.startsWith("message:")) {
            setFieldError("message", err.replace(/^message:\s*/i, ""));
          }
        });
        showStatus(data.message || "Please fix the errors above.", "error");
      } else {
        showStatus(
          data.message ||
            "Unable to send your message. Please try again later.",
          "error"
        );
      }
    } catch (err) {
      showStatus(
        "Network error. Please check your connection and try again.",
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
