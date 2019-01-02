OPTIND=1         # Reset in case getopts has been used previously in the shell.

test=1

while getopts ":d" opt; do
  case $opt in
    d)
      test=0
      echo "-a was triggered!" >&2
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      ;;
  esac
done

for FILE in $(git ls-files ./app/public/img); do
    git grep $(basename "$FILE") > /dev/null ||
      if [ "$test" == 1 ]; then
        echo "would remove $FILE";
      else
        git rm "$FILE"
      fi
done