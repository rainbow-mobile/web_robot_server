#!/usr/bin/env bash

npx commitlint --edit "$1" || {
  echo
  echo "❌ 커밋 메시지가 Conventional Commit 규칙에 맞지 않습니다."
  echo "💡 예: 'feat: 기능 추가' 또는 'fix: 버그 수정'"
  echo "📚 형식 참고: https://www.conventionalcommits.org/ko/v1.0.0/"
  exit 1
}