# This is an overview of handy tailwind snippets.

## Floating input labels

A tutorial can be found here: https://www.youtube.com/watch?v=nJzKi6oIvBA

And a sourcecode example can be found here: https://play.tailwindcss.com/cwqORB8ee7

For a quick copy paste:

```HTML
<div class="relative">
    <input id="email" name="email" type="text" class="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-rose-600" placeholder="john@doe.com" />
    <label for="email" class="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">
        Email address
    </label>
</div>
```
