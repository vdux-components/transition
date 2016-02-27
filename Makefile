#
# Vars
#

BIN = ./node_modules/.bin
.DEFAULT_GOAL := all

#
# Tasks
#

node_modules: package.json
	@npm install
	@touch node_modules

test: $(src) $(tests)
	@NODE_ENV=development hihat test/index.js -- \
		--debug \
		-t babelify \
		-p tap-dev-tool
		
validate: node_modules
	@standard
	
init:
	@git init
	@git add .
	@git commit -am "initial"
	@hub create vdux-components/transition -d "Transition component, analogous to React&#x27;s ReactTransitionGroup"
	@travis enable
	@git push -u origin master

clean:
	@rm -rf lib

build: clean
	babel src --out-dir lib

all: validate test

#
# Phony
#

.PHONY: test validate clean build
