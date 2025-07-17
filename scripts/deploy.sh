#!/bin/bash

###################
# 유�리티 함수들 #
###################

# 컬러 출력 함수
function print_string(){
  local RED='\033[0;31m'
  local GREEN='\033[0;32m'
  local YELLOW='\033[1;33m'
  local NC='\033[0m'

  case "$1" in
    "error") echo -e "${RED}${2}${NC}" ;;
    "success") echo -e "${GREEN}${2}${NC}" ;;
    "warning") echo -e "${YELLOW}${2}${NC}" ;;
    "info") echo -e "${NC}${2}${NC}" ;;
  esac
}

# hotfix 여부를 선택하는 함수
function ask_hotfix() {
    local hotfix_response="no"  # 기본값을 "no"로 설정

    print_string "info" "이 배포가 hotfix 인가요? (y나 yes면 핫픽스, 아니면 Enter):" > /dev/tty

    read -r input < /dev/tty
    input=$(echo "$input" | tr '[:upper:]' '[:lower:]')  # 입력을 소문자로 변환

    if [[ "$input" == "y" || "$input" == "yes" ]]; then
        hotfix_response="yes"
    fi

    echo "$hotfix_response"
}

# Git tag 작업 수행
function git_tag_work() {
    local current_branch=$1
    local new_version=$2
    local tag_version=$3
    local release_message=$4

    # dist 파일을 스테이징에 추가
    if [ -d "dist" ]; then
        git add -f "dist" || { print_string "error" "Git add dist 실패"; return 1; }
    fi

    # 태그용 임시 커밋 생성
    git commit --allow-empty -m "chore: Release ${new_version}" || { print_string "error" "Git commit 실패"; return 1; }
    
    # 태그 생성 및 푸시
    git tag -a $tag_version -m "$release_message" || { print_string "error" "Git tag 생성 실패"; return 1; }
    git push origin $tag_version || { print_string "error" "Git tag push 실패"; return 1; }
    git tag -d $tag_version || { print_string "error" "Git tag 삭제 실패"; return 1; }
    
    # 임시 커밋 되돌리기
    git reset --soft HEAD~1 || { print_string "error" "Git reset 실패"; return 1; }
    
    # dist 파일을 스테이징에서 제거
    if [ -d "dist" ]; then
        git rm -r --cached "dist" || { print_string "error" "Git rm dist 실패"; return 1; }
    fi

    git commit --allow-empty -m "chore: dist 폴더 Git 추적 제거" || { print_string "error" "Git commit 실패"; return 1; }
    git push origin $current_branch || { print_string "error" "Git push 실패"; return 1; }
    
    return 0
}

# 빌드 프로세스
function build_project() {
    print_string "info" "프로젝트 빌드 중..."
    [ -d "dist" ] && rm -rf dist
    
    npm install && npm run build || { 
        print_string "error" "빌드 실패"
        return 1
    }
    print_string "success" "패키지 설치 및 빌드 완료"
    return 0
}

# CHANGELOG 업데이트 함수 추가
function update_release_log() {
    local version=$1
    local message=$2
    local date=$(date +%Y-%m-%d)
    local release_log_file="RELEASE_LOG.md"
    
    # RELEASE_LOG.md 파일이 없으면 생성
    if [ ! -f $release_log_file ]; then
        echo "# Release Log\n" > $release_log_file
    fi
    
    # 임시 파일 생성
    local temp_file=$(mktemp)
    
    # 새로운 변경사항을 파일 상단에 추가
    echo "# Release log" > "$temp_file"
    echo "" >> "$temp_file"
    echo "## [$version] - $date" >> "$temp_file"

    echo "$message" | while IFS= read -r line; do
        if [ ! -z "$line" ]; then
            echo "- $line" >> "$temp_file"
        fi
    done
    
    echo "" >> "$temp_file"
    
    # 기존 내용에서 첫 줄(# Release Log)을 제외한 나머지를 추가
    tail -n +2 "$release_log_file" 2>/dev/null >> "$temp_file"
    
    # 임시 파일을 RELEASE_LOG.md로 이동
    mv "$temp_file" "$release_log_file"
    
    # Git에 RELEASE_LOG.md 추가
    git add $release_log_file
    git commit -m "docs: update RELEASE_LOG.md for version $version"
    git push origin $current_branch
}

# 완료 메시지 출력
function print_completion_message() {
    local version=$1
    
    print_string "success" "=================================="

    print_string "success" "✨🎉 v $version 배포 완료 🎉✨"

    print_string "success" "=================================="
}

#######################
# 메인 스크립트 실행 #
#######################

# 현재 브랜치 저장
last_git_work_status="normal"

timestamp=$(date +%Y%m%d%H%M%S)
current_branch=$(git rev-parse --abbrev-ref HEAD)

# 브랜치 검증
# if [[ "$current_branch" != "main" ]]; then
#     print_string "error" "현재 브랜치가 $current_branch 입니다. main 브랜치로 변경 후 배포 작업을 진행해주세요."
#     exit 1
# fi

if [[ "$current_branch" = "main" ]]; then
    # 메인 스크립트 실행 부분에 hotfix 여부 확인 추가
    is_hotfix=$(ask_hotfix)
    echo "Hotfix 여부: $is_hotfix"
fi

# 빌드 실행
build_project || exit 1

# 현재 버전 생성
new_version="rrs-${timestamp}"

# 태그 버전 생성
if [ "$is_hotfix" = "yes" ]; then
    tag_version="release_hotfix/${current_branch}/${new_version}"
else
    tag_version="release/${current_branch}/${new_version}"
fi

# 릴리즈 메시지 생성
release_message="Release App: RRS, Branch: ${current_branch}, Version: ${new_version}] release 배포"

# Git 작업 실행
git_tag_work "$current_branch" "$new_version" "$tag_version" "$release_message" || last_git_work_status="bad"

# RELEASE_LOG 업데이트
if [ "$last_git_work_status" = "normal" ]; then
    update_release_log "$new_version" "$release_message"
else
    git tag -d $tag_version
    git push origin --delete $tag_version
fi

# 완료 메시지 출력
if [ "$last_git_work_status" = "normal" ]; then
    print_completion_message "$new_version"
fi

# 최종 상태에 따라 종료
if [ "$last_git_work_status" = "normal" ]; then
    exit 0
else
    exit 1
fi
