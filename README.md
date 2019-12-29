# Directions
- Clone these into wherever you'd like
- In `setup.sh`, change the `DOTFILES_DIR` variable to point towards whatever directory you want these to live in
- Run the setup: 

```sh
sh setup.sh
```

## Making changes to your dotfiles
Since the source of truth is now wherever you have this repo cloned, it is advisable that you make any changes to your dotfiles there and then run the `sync` script to reflect your changes in your `$HOME`.

```sh
sh sync.sh
```