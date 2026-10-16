/**
 * Puts back the email addresses hidden by the `obfuscate_emails` Twig filter (modules/statik/src/web/twig/EmailExtension.php):
 * - [data-mailto]: the link's mailto href;
 * - [data-email]: the address as text (instead of the readable "info [at] statik [dot] be").
 * The values are base64 of the reversed text. Each attribute is removed once it's done, so content loaded later is handled
 * on its own.
 */
export default class EmailComponent {
  constructor() {
    document.querySelectorAll<HTMLElement>('[data-mailto]').forEach((link) => {
      const href = EmailComponent.decode(link.getAttribute('data-mailto'));
      link.removeAttribute('data-mailto');
      if (href.startsWith('mailto:')) {
        link.setAttribute('href', href);
      }
    });

    document.querySelectorAll<HTMLElement>('[data-email]').forEach((element) => {
      const email = EmailComponent.decode(element.getAttribute('data-email'));
      element.removeAttribute('data-email');
      if (email) {
        element.textContent = email;
      }
    });
  }

  private static decode(value: string | null): string {
    if (!value) {
      return '';
    }
    try {
      const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
      return [...new TextDecoder().decode(bytes)].reverse().join('');
    } catch {
      return '';
    }
  }
}
