function sync() {
	rsync --exclude ".git/" \
		--exclude "README.md" \
		--exclude "brew.sh" \
        --exclude "sync.sh" \
		--exclude "setup.sh" \
		-avh --no-perms . ~
}

sync
unset sync