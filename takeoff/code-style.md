# Takeoff Code Style

## Sass

###

### Extends before mixins, mixins before css rules

__Exception:__ breakpoint mixins - these should always come last

✘
```
.link__icon {

    @include fsRem(20px);
    vertical-align: middle;
    @extend %ext-icon;

    @include breakpoint(map-get($breakpoints, med)) {
        @include fsRem(24px);
    }
}
```

✔
```
.link__icon {

    @extend %ext-icon;
    @include fsRem(20px);
    vertical-align: middle;

    @include breakpoint(map-get($breakpoints, med)) {
        @include fsRem(24px);
    }
}
```

### In .scss files, Blocks should always come first, with default Elements, Modifiers should come at the top level after Blocks

✘
```
.link {
  &--ext {
    ...
  }
  &__icon {
    ...
  }
}
```

✔
```
.link {
  &__icon {
    ...
  }
}

.link--ext {
  ...
}
```
