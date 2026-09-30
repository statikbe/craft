<?php

/**
 * Formie theme config: the classes Formie renders on its forms, applied to every form.
 * Based on https://github.com/verbb/formie-theme-configs (tailwind), using the form variables
 * from frontend/css/site/theme.css as Tailwind utilities (e.g. `text-form-error-text`, `bg-form-error-bg`).
 *
 * `resetClasses` removes all default `fui-*` classes. Form elements (inputs, selects, checkboxes, radios)
 * are styled globally for every form in frontend/css/site/components/form.css; this file handles the
 * Formie-specific markup: layout, labels, instructions, errors, alerts, buttons, pages and special fields.
 *
 * Tailwind scans this file (see the @source in frontend/css/site/main.css), so any utility class works here.
 * Note: `text-form-label` only sets the color (--color-form-label), the size needs `text-(length:--text-form-label)`;
 * and `--font-form-*` are weights, so use `font-(--font-form-label)` (`font-form-label` would set the font-family).
 * Per-form overrides can still be passed to `craft.formie.renderForm(form, { themeConfig: { … } })`; they are merged on top.
 * Docs: https://verbb.io/craft-plugins/formie/docs/theming/theme-config
 */

return [
    'themeConfig' => [
        'resetClasses' => true,

        'formTitle' => [
            'attributes' => [
                'class' => 'mb-4 text-lg font-bold',
            ],
        ],

        'alertError' => [
            'attributes' => [
                'class' => 'p-4 my-4 border border-form-error-text bg-form-error-bg text-form-error-text',
            ],
        ],

        'alertSuccess' => [
            'attributes' => [
                'class' => 'p-4 my-4 border border-form-success-text bg-form-success-bg text-form-success-text',
            ],
        ],

        'buttonWrapper' => [
            'attributes' => [
                'class' => [
                    'flex flex-wrap gap-4 justify-start mt-6',
                    "{{ buttonsPosition == 'right' ? 'justify-end' }}",
                    "{{ buttonsPosition == 'center' ? 'justify-center' }}",
                    "{{ buttonsPosition == 'left-right' ? 'justify-between' }}",
                    "{{ buttonsPosition == 'right-save-left' ? 'justify-start flex-row-reverse' }}",
                    "{{ buttonsPosition == 'center-save-left' ? 'justify-center flex-row-reverse' }}",
                    "{{ buttonsPosition == 'center-save-right' ? 'justify-center' }}",
                    "{{ buttonsPosition == 'save-right' ? 'justify-between' }}",
                    "{{ buttonsPosition == 'save-left' ? 'justify-between flex-row-reverse' }}",
                ],
            ],
        ],

        'buttonContainer' => [
            'attributes' => [
                'class' => 'flex flex-wrap gap-4',
            ],
        ],

        'saveButton' => [
            'attributes' => [
                'class' => 'btn btn--ghost',
            ],
        ],

        'backButton' => [
            'attributes' => [
                'class' => 'btn btn--secondary',
            ],
        ],

        'submitButton' => [
            'attributes' => [
                'class' => 'btn btn--primary btn--ext order-10',
            ],
        ],

        'page' => [
            'attributes' => [
                'class' => [
                    "{{ form.hasMultiplePages() and page.id != currentPage.id ? 'hidden' : false }}",
                ],
            ],
        ],

        'pageTabs' => [
            'attributes' => [
                'class' => 'flex gap-8 mb-6 border-b border-gray-200',
            ],
        ],

        'pageTab' => [
            'attributes' => [
                'class' => '-mb-px',
            ],
        ],

        'pageTabLink' => [
            'attributes' => [
                'class' => [
                    'block py-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap',
                    "{{ (page.id == currentPage.id) ? 'border-primary text-primary' : 'border-transparent hover:border-gray-300' }}",
                    "{{ page.getFieldErrors(submission) ? 'text-form-error-text' : false }}",
                ],
            ],
        ],

        'pageTitle' => [
            'attributes' => [
                'class' => 'mb-4 text-lg font-bold',
            ],
        ],

        'progress' => [
            'attributes' => [
                'class' => 'flex h-5 mt-4 text-sm text-white bg-gray-200',
            ],
        ],

        'progressContainer' => [
            'attributes' => [
                'class' => 'flex flex-col justify-center text-center font-bold bg-primary',
            ],
        ],

        // Fields sit next to each other from sm, stacked below
        'row' => [
            'attributes' => [
                'class' => [
                    'flex flex-col gap-4 mb-6 sm:flex-row',
                    "{{ row.getIsHidden() ? 'hidden' }}",
                ],
            ],
        ],

        'subFieldRow' => [
            'attributes' => [
                'class' => 'flex flex-col gap-4 mb-4 last:mb-0 sm:flex-row',
            ],
        ],

        'nestedFieldRows' => [
            'attributes' => [
                'class' => 'py-4 border-y border-gray-200',
            ],
        ],

        'nestedFieldRow' => [
            'attributes' => [
                'class' => 'flex flex-col gap-4 mb-4 last:mb-0 sm:flex-row',
            ],
        ],

        'field' => [
            'attributes' => [
                'class' => 'flex-1 min-w-0 data-[conditionally-hidden=true]:hidden',
            ],
        ],

        // Fields with subfields (Name, Address, Date) render their label as a <legend>: a bit more space below it
        'fieldLabel' => [
            'attributes' => [
                'class' => 'block mb-2 [legend&]:mb-4 text-form-label text-(length:--text-form-label) font-(--font-form-label) leading-none',
            ],
        ],

        'fieldRequired' => [
            'attributes' => [
                'class' => 'text-form-error-text',
            ],
        ],

        'fieldInstructions' => [
            'attributes' => [
                'class' => 'my-2 text-sm italic',
            ],
        ],

        'fieldInput' => [
            'attributes' => [
                'class' => [
                    'block w-full',
                    "{{ (submission.getErrors(field.handle) ?? null) ? 'has-error' }}",
                ],
            ],
        ],

        'fieldError' => [
            'attributes' => [
                'class' => 'mt-1 text-form-error-text text-form-error font-(--font-form-error)',
            ],
        ],

        'fieldAddButton' => [
            'attributes' => [
                'class' => 'btn btn--secondary',
            ],
        ],

        'fieldRemoveButton' => [
            'attributes' => [
                'class' => 'btn btn--secondary',
            ],
        ],

        'fieldLimit' => [
            'attributes' => [
                'class' => 'mt-2 text-sm',
            ],
        ],

        'fieldRichText' => [
            'attributes' => [
                'class' => 'relative',
            ],
        ],

        'agree' => [
            'fieldOption' => [
                'attributes' => [
                    'class' => 'flex items-start',
                ],
            ],

            'fieldOptionLabel' => [
                'attributes' => [
                    'class' => 'mb-0 text-base font-normal leading-snug [&_a]:underline [&_a:hover]:no-underline',
                ],
            ],

            'fieldInput' => [
                'resetClass' => true,

                'attributes' => [
                    'class' => 'shrink-0 mt-0.5',
                ],
            ],
        ],

        'checkboxes' => [
            'fieldOption' => [
                'attributes' => [
                    'class' => [
                        "{{ field.layout == 'horizontal' ? 'inline-flex items-start me-4 mb-2' : 'flex items-start mb-2' }}",
                    ],
                ],
            ],

            'fieldOptionLabel' => [
                'attributes' => [
                    'class' => 'mb-0 text-base font-normal leading-snug [&_a]:underline [&_a:hover]:no-underline',
                ],
            ],

            'fieldInput' => [
                'resetClass' => true,

                'attributes' => [
                    'class' => 'shrink-0 mt-0.5',
                ],
            ],
        ],

        'radioButtons' => [
            'fieldOption' => [
                'attributes' => [
                    'class' => [
                        "{{ field.layout == 'horizontal' ? 'inline-flex items-start me-4 mb-2' : 'flex items-start mb-2' }}",
                    ],
                ],
            ],

            'fieldOptionLabel' => [
                'attributes' => [
                    'class' => 'mb-0 text-base font-normal leading-snug',
                ],
            ],

            'fieldInput' => [
                'resetClass' => true,

                'attributes' => [
                    'class' => 'shrink-0 mt-0.5',
                ],
            ],
        ],

        'dropdown' => [
            'fieldInput' => [
                'resetClass' => true,

                'attributes' => [
                    'class' => 'block w-full',
                ],
            ],
        ],

        'fileUpload' => [
            'fieldInput' => [
                'resetClass' => true,

                'attributes' => [
                    'class' => 'block w-full text-sm file:me-4 file:py-2 file:px-4 file:border-0 file:rounded-form-element-border file:bg-light file:font-bold',
                ],
            ],
        ],

        'hiddenField' => [
            'field' => [
                'resetClass' => true,

                'attributes' => [
                    'class' => 'hidden',
                ],
            ],
        ],

        'recipients' => [
            'field' => [
                'attributes' => [
                    'class' => [
                        "{{ field.getIsHidden() ? 'hidden' : false }}",
                    ],
                ],
            ],
        ],

        'repeater' => [
            'nestedField' => [
                'attributes' => [
                    'class' => 'relative',
                ],
            ],

            'nestedFieldWrapper' => [
                'attributes' => [
                    'class' => 'mb-4',
                ],
            ],

            'fieldRemoveButton' => [
                'attributes' => [
                    'class' => 'absolute top-0 right-0 text-sm underline hover:no-underline',
                ],
            ],
        ],

        'signature' => [
            'fieldInputContainer' => [
                'attributes' => [
                    'class' => 'relative',
                ],
            ],

            'fieldCanvas' => [
                'attributes' => [
                    'class' => 'w-full h-32 rounded-form-element-border bg-form-element-bg [border:var(--border-form-element)]',
                ],
            ],

            'fieldRemoveButton' => [
                'attributes' => [
                    'class' => 'absolute top-0 right-0 m-2 text-sm underline hover:no-underline',
                ],
            ],
        ],

        'table' => [
            'fieldTable' => [
                'attributes' => [
                    'class' => 'w-full',
                ],
            ],

            'fieldTableHeaderColumn' => [
                'attributes' => [
                    'class' => 'pe-2 pb-2 text-left text-form-label text-(length:--text-form-label) font-(--font-form-label)',
                ],
            ],

            'fieldTableBodyColumn' => [
                'attributes' => [
                    'class' => 'pe-2 pb-2',
                ],
            ],

            // Icon buttons, see .form-table-add-btn / .form-table-remove-btn in form.css
            'fieldAddButton' => [
                'attributes' => [
                    'class' => 'form-table-add-btn',
                ],
            ],

            'fieldRemoveButton' => [
                'attributes' => [
                    'class' => 'form-table-remove-btn',
                ],
            ],
        ],
    ],
];
