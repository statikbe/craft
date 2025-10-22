# Password confirm

If you want people to use strong passwords, you need this plugin.

## Example

<iframe src="../../examples/password_strength.html" height="350"></iframe>

```HTML
<form action="#" data-validate>
    <div>
        <label for="password">Password Strength</label>
        <input id="passwordStrength" type="password" name="password" data-strength
                    data-min-length="8"
                    data-max-length="30"
                    data-cases="true"
                    data-numbers="true"
                    data-symbols="true"
                    data-show-strength-indicator="true"
                    data-show-strength-indicator-text="true"
                    required>
    </div>
    <div class="mt-4">
        <button type="submit" class="btn">Submit</button>
    </div>
</form>
```

## Attributes

| Attribute                           | Default | Description                              |
| ----------------------------------- | ------- | ---------------------------------------- |
| `data-strength`                     |         | Triggers the plugin                      |
| `data-min-length`                   | 8       | The minimum length of the password       |
| `data-max-length`                   | 30      | The maximum length of the password       |
| `data-cases`                        | true    | If the password needs uppercase letters  |
| `data-numbers`                      | true    | If the password needs numbers            |
| `data-symbols`                      | true    | If the password needs special characters |
| `data-show-strength-indicator`      | true    | Show the strength indicator              |
| `data-show-strength-indicator-text` | true    | Show the strength indicator text         |
