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
