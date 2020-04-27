#!/bin/bash

# Install Homebrew
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

# Setup cask
brew tap homebrew/cask

# update / upgrade
brew update
brew upgrade

# GNU utils
brew install coreutils

# The basics
brew install git
brew install htop
brew install vim
brew install watch
brew install exa
brew install diff-so-fancy
brew install node

# zsh
brew install zsh zsh-completions

# Main packages
brew cask install alfred
brew cask install google-chrome
brew cask install firefox
brew cask install spotify
brew cask install slack
brew cask install visual-studio-code
brew cask install webstorm
brew cask install iterm2
brew cask install lastpass

# fonts
brew tap homebrew/cask-fonts 
brew cask install font-fira-code
brew cask install font-firacode-nerd-font
brew cask install font-hack-nerd-font

# cleanup
brew cleanup



