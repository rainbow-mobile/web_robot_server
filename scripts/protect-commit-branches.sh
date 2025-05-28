BRANCH=$(git rev-parse --abbrev-ref HEAD)
CHANGED_FILES=$(git diff --cached --name-only)

ALLOW_REGEX='^(\.github/workflows/|lefthook\.yml$|RELEASE_LOG\.md$|yarn\.lock$|(.*/)?yarn\.lock$|package\.json$|(.*/)?package\.json$|dist/|.*/dist/|scripts/deploy\.sh$|scripts/protect-commit-branches\.sh$|mf_deploy_time\.json$|commitlint.config.js$|\.vscode/|.*/assets/)'


if [ "$BRANCH" = "main" ]; then
    echo $CHANGED_FILES
    for file in $CHANGED_FILES; do
    if ! [[ "$file" =~ $ALLOW_REGEX ]]; then
        echo "❌ main 브랜치에는 직접 커밋할 수 없습니다. PR을 통한 병합을 진행해주세요."
        exit 1
    fi
    done
fi