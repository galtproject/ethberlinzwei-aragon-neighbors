.PHONY: test benchmark report

cleanup:
	rm -rf ./build

compile: cleanup
	npm run compile
	tput bel

validate:
	npm run ethlint
	npm run eslint

test: only-skip
	-npm test
	tput bel
	$(MAKE) only-recover

ctest: compile test
