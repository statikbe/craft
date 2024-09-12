export class accordionComponent {
  constructor() {
    this.initAccordions();
  }

  private initAccordions() {
    const RO = new ResizeObserver((entries) => {
      return entries.forEach((entry) => {
        const accordion = entry.target as HTMLDetailsElement;
        const width = parseInt(accordion.dataset.width, 10);

        // If the width of the accordion has changed, reset the height
        if (width !== entry.contentRect.width) {
          accordion.removeAttribute("style");
          setHeight(accordion);
          setHeight(accordion, true);
          accordion.open = false;
        }
      });
    });

    const accordions = document.querySelectorAll("details");

    // If the accordion has the data-accordion-animation attribute, observe it
    accordions.forEach((accordion: HTMLElement) => {
      if (accordion.hasAttribute("data-accordion-animation")) {
        RO.observe(accordion);
      }
    });

    const setHeight = (accordion: HTMLDetailsElement, open = false) => {
      accordion.open = open;

      // Get the height of the accordion content
      const rect = accordion.getBoundingClientRect();

      // Set the width of the accordion
      accordion.dataset.width = rect.width.toString();

      // Set the height of the accordion content
      accordion.style.setProperty(
        open ? `--expanded` : `--collapsed`,
        `${rect.height}px`
      );

      // Add the custom transition duration
      const animationDuration = accordion.getAttribute(
        "data-accordion-duration"
      );

      if (accordion.hasAttribute("data-accordion-duration")) {
        accordion.style.transition = `height ${animationDuration}ms cubic-bezier(0.4, 0.01, 0.165, 0.99)`;
      }

      // Add a second close button to the accordion
      const closeButton = accordion.querySelector("[data-accordion-close]");

      if (closeButton) {
        closeButton.addEventListener("click", () => {
          accordion.open = false;
        });
      }
    };

    // Close any open accordions when another is opened
    const groupAccordion = document.querySelectorAll("[data-accordion-group]");

    groupAccordion.forEach((group: HTMLElement) => {
      const accordions = group.querySelectorAll("details");

      accordions.forEach((accordion: HTMLDetailsElement) => {
        accordion.addEventListener("toggle", (e) => {
          if ((e.target as any).open) {
            accordions.forEach((accordion: HTMLDetailsElement) => {
              if (accordion !== e.target) {
                (accordion as any).open = false;
              }
            });
          }
        });
      });
    });
  }
}
