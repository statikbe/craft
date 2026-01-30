import { Formatter } from '../utils/formater';

export default class CKEditorComponent {
  constructor() {
    this.init();
  }

  private async init() {
    const ckeEditor = document.querySelectorAll('[data-ck-editor]') as NodeListOf<HTMLElement>;
    if (!ckeEditor) return;

    const ClassicEditor = await import('@ckeditor/ckeditor5-build-classic');

    ckeEditor.forEach((editor) => {
      let toolbar = ['heading', 'bold', 'italic', 'insertImage', 'link'];
      if (editor.hasAttribute('data-ck-editor-style')) {
        if (editor.getAttribute('data-ck-editor-style') === 'compact') {
          toolbar = ['bold', 'italic', 'numberedList', 'bulletedList'];
        }
      }
      if (editor.hasAttribute('data-ck-editor-toolbar')) {
        const toolbarAttr = editor.getAttribute('data-ck-editor-toolbar');
        if (toolbarAttr) {
          toolbar = toolbarAttr.split(',');
        }
      }
      let linkOptions = {
        defaultProtocol: 'https://',
        decorators: {
          openInNewTab: {
            mode: 'automatic',
            callback: (url) => true,
            attributes: {
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          },
        },
      };
      if (editor.hasAttribute('data-ck-editor-link-nofollow')) {
        linkOptions.decorators['addNofollow'] = {
          mode: 'automatic',
          callback: (url) => true,
          attributes: {
            rel: 'nofollow',
          },
        };
      }

      if (
        editor.hasAttribute('data-ck-editor-link-open-new-tab') &&
        editor.getAttribute('data-ck-editor-link-open-new-tab') == 'false'
      ) {
        delete linkOptions.decorators['openInNewTab'];
      }

      ClassicEditor.default
        .create(editor, {
          licenseKey: 'GPL',
          toolbar: toolbar,
          simpleUpload: {
            uploadUrl: 'statik/wiki/upload-image',
          },
          link: linkOptions,
          heading: {
            options: [
              {
                model: 'paragraph',
                title: 'Paragraph',
                class: 'ck-heading_paragraph',
              },
              {
                model: 'heading1',
                view: 'h1',
                title: 'Heading 1',
                class: 'ck-heading_heading1',
              },
              {
                model: 'heading2',
                view: 'h2',
                title: 'Heading 2',
                class: 'ck-heading_heading2',
              },
              {
                model: 'heading3',
                view: 'h3',
                title: 'Heading 3',
                class: 'ck-heading_heading3',
              },
              {
                model: 'heading4',
                view: 'h4',
                title: 'Heading 4',
                class: 'ck-heading_heading4',
              },
              {
                model: 'heading5',
                view: 'h5',
                title: 'Heading 5',
                class: 'ck-heading_heading5',
              },
              {
                model: 'heading6',
                view: 'h6',
                title: 'Heading 6',
                class: 'ck-heading_heading6',
              },
            ],
          },
        })
        .then((editor) => {
          if (editor.sourceElement.hasAttribute('data-ck-editor-wordcount')) {
            const wordcountAttr = editor.sourceElement.getAttribute('data-ck-editor-wordcount');
            if (wordcountAttr) {
              const wordcountElement = document.getElementById(wordcountAttr);
              if (wordcountElement) {
                const wordCountTemplateID = wordcountElement.getAttribute('data-template');
                const wordCountTemplate = document.getElementById(wordCountTemplateID || '') as HTMLTemplateElement;

                const limitAttr = editor.sourceElement.getAttribute('data-ck-editor-limit') || '0';
                const CHARACTER_LIMIT = parseInt(limitAttr, 10);

                // Update word count function
                const updateWordCount = (data: string) => {
                  const text = data
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                  const words = text ? text.split(' ').filter((word) => word.length > 0).length : 0;
                  const characters = text.length;

                  wordcountElement.innerHTML = Formatter.evaluateJSTemplate(wordCountTemplate.innerHTML, {
                    words,
                    characters,
                    limit: CHARACTER_LIMIT,
                  });
                };

                let previousData = editor.getData();

                if (CHARACTER_LIMIT > 0) {
                  editor.model.document.on('change:data', () => {
                    const data = editor.getData();
                    const text = data
                      .replace(/<[^>]*>/g, ' ')
                      .replace(/\s+/g, ' ')
                      .trim();

                    if (text.length > CHARACTER_LIMIT) {
                      // Revert to previous state to prevent exceeding limit
                      editor.setData(previousData);
                    } else {
                      previousData = data;
                    }

                    editor.sourceElement.innerHTML = editor.getData();
                    updateWordCount(editor.getData());
                  });
                }

                // Initial count
                updateWordCount(editor.getData());
              }
            }
          }
        });
    });
  }
}
