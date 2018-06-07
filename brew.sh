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

# Main packages
brew cask install alfred
brew cask install google-chrome
brew cask install spotify
brew cask install slack
brew cask install visual-studio-code
brew cask install iterm2
brew install zsh zsh-completions
brew install diff-so-fancy
brew install node

# fonts
brew tap caskroom/fonts
brew cask install font-fira-code

# cleanup
brew cleanup



