export class ckeEditorComponent {
  constructor() {
    this.init();
  }

  private async init() {
    const ckeEditor = document.querySelectorAll(
      ".js-cke-editor"
    ) as NodeListOf<HTMLElement>;
    if (!ckeEditor) return;

    const ClassicEditor = await import("@ckeditor/ckeditor5-build-classic");

    ckeEditor.forEach((editor) => {
      let toolbar = ["heading", "bold", "italic", "insertImage", "link"];
      if (editor.hasAttribute("data-cke-editor-style")) {
        if (editor.getAttribute("data-cke-editor-style") === "compact") {
          toolbar = ["bold", "italic", "numberedList", "bulletedList"];
        }
      }
      ClassicEditor.default
        .create(editor, {
          toolbar: toolbar,
          simpleUpload: {
            uploadUrl: "statik/wiki/upload-image",
          },
          heading: {
            options: [
              {
                model: "paragraph",
                title: "Paragraph",
                class: "ck-heading_paragraph",
              },
              {
                model: "heading1",
                view: "h1",
                title: "Heading 1",
                class: "ck-heading_heading1",
              },
              {
                model: "heading2",
                view: "h2",
                title: "Heading 2",
                class: "ck-heading_heading2",
              },
              {
                model: "heading3",
                view: "h3",
                title: "Heading 3",
                class: "ck-heading_heading3",
              },
              {
                model: "heading4",
                view: "h4",
                title: "Heading 4",
                class: "ck-heading_heading4",
              },
              {
                model: "heading5",
                view: "h5",
                title: "Heading 5",
                class: "ck-heading_heading5",
              },
              {
                model: "heading6",
                view: "h6",
                title: "Heading 6",
                class: "ck-heading_heading6",
              },
            ],
          },
        })
        .then((editor) => {
          editor.model.document.on("change", () => {
            const data = editor.getData();
            editor.sourceElement.innerHTML = data;
          });
        });
    });
  }
}
