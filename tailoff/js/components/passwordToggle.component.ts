export class PasswordToggleComponent {
  constructor() {
    const items = document.querySelectorAll(".js-password-toggle");
    Array.from(items).forEach((item) => {
      const btn = item.querySelector("button");
      const input = item.querySelector("input");
      const showIcon = item.querySelector(".js-password-toggle-show");
      const hideIcon = item.querySelector(".js-password-toggle-hide");
      btn.addEventListener("click", () => {
        if (input.getAttribute("type") === "password") {
          input.setAttribute("type", "text");
          showIcon.classList.add("hidden");
          hideIcon.classList.remove("hidden");
        } else {
          input.setAttribute("type", "password");
          hideIcon.classList.add("hidden");
          showIcon.classList.remove("hidden");
        }
      });
    });
  }
}
