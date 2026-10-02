(function () {
  var MID = window.GA4_MEASUREMENT_ID || "G-XXXXXXXXXX";
  if (!MID || MID === "G-XXXXXXXXXX") {
    console.warn("GA4 disabled: set window.GA4_MEASUREMENT_ID before loading scripts/ga4.js");
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  var tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MID);
  document.head.appendChild(tag);

  gtag("js", new Date());
  gtag("config", MID, { send_page_view: true });

  window.trackEvent = function (name, params) {
    try {
      gtag("event", name, params || {});
    } catch (_) {}
  };

  var nativeFetch = window.fetch;
  if (typeof nativeFetch !== "function") {
    return;
  }

  function normalizeUrl(input) {
    if (typeof input === "string") return input;
    if (input && typeof input.url === "string") return input.url;
    return "";
  }

  function trackByEndpoint(url, body, data) {
    if (!data || data.success !== true) return;

    if (url.indexOf("register.php") !== -1) {
      window.trackEvent("sign_up", { method: "email" });
      return;
    }
    if (url.indexOf("loginn.php") !== -1) {
      window.trackEvent("login", { method: "email" });
      return;
    }
    if (url.indexOf("verify_code.php") !== -1) {
      if (body && body.indexOf("resend=1") !== -1) {
        window.trackEvent("verification_code_resent", { method: "email" });
      } else {
        window.trackEvent("email_verified", { method: "email" });
      }
      return;
    }
    if (url.indexOf("exam_submit.php") !== -1) {
      window.trackEvent("exam_submitted", {
        score: typeof data.score === "number" ? data.score : undefined
      });
      return;
    }
    if (url.indexOf("speaking_confirm.php") !== -1) {
      window.trackEvent("speaking_request_confirmed", {});
      return;
    }
    if (url.indexOf("teacher_access.php") !== -1) {
      window.trackEvent("teacher_access_granted", {});
      return;
    }
    if (url.indexOf("api_reset_password.php") !== -1) {
      window.trackEvent("password_reset", { method: "security_question" });
    }
  }

  window.fetch = function (input, init) {
    var url = normalizeUrl(input);
    var body = "";
    if (init && typeof init.body === "string") {
      body = init.body;
    } else if (init && init.body instanceof URLSearchParams) {
      body = init.body.toString();
    }

    return nativeFetch(input, init).then(function (res) {
      try {
        var ct = res.headers.get("content-type") || "";
        if (ct.indexOf("application/json") !== -1) {
          res.clone().json().then(function (data) {
            trackByEndpoint(url, body, data);
          }).catch(function () {});
        }
      } catch (_) {}
      return res;
    });
  };
})();


