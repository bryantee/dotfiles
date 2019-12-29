#!/bin/bash

DOTFILES_DIR="$HOME/.dotfiles"

# setup xcode tools
xcode-select --install

# brew install
sh brew.sh

# set zsh default
chsh -s /usr/local/bin/zsh

# oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

# TODO: replace w/ rsync solution
# sym link files
ln -sfv "$DOTFILES_DIR/.zshrc" ~
ln -sfv "$DOTFILES_DIR/.gitconfig" ~

