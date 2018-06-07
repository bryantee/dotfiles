DOTFILES_DIR="$HOME/.dotfiles"

# brew install
sh brew.sh

# sym link files
ln -sfv "$DOTFILES_DIR/.zshrc" ~
ln -sfv "$DOTFILES_DIR/.gitconfig" ~
ln -sfv "$DOTFILES_DIR/.gitkraken" ~
ln -sfv "$DOTFILES_DIR/.WebStorm" ~
ln -sfv "$DOTFILES_DIR/.vscode" ~

