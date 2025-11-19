export class FormPrototypes {
  constructor() {}

  public static activateSerialize() {
    // function borrowed from https://gomakethings.com/how-to-serialize-form-data-with-vanilla-js/
    HTMLFormElement.prototype.serialize = function() {
      // Setup our serialized data
      let serialized = [];

      // Loop through each field in the form
      for (let i = 0; i < this.elements.length; i++) {
        let field = this.elements[i];

        // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
        if (
          !field.name ||
          field.disabled ||
          field.type === "file" ||
          field.type === "reset" ||
          field.type === "submit" ||
          field.type === "button"
        )
          continue;

        // If a multi-select, get all selections
        if (field.type === "select-multiple") {
          for (var n = 0; n < field.options.length; n++) {
            if (!field.options[n].selected) continue;
            serialized.push(
              encodeURIComponent(field.name) +
                "=" +
                encodeURIComponent(field.options[n].value)
            );
          }
        }

        // Convert field data to a query string
        else if (
          (field.type !== "checkbox" && field.type !== "radio") ||
          field.checked
        ) {
          serialized.push(
            encodeURIComponent(field.name) +
              "=" +
              encodeURIComponent(field.value)
          );
        }
      }

      return serialized.join("&");
    };
  }
}
