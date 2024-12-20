export const HttpStatusMessagesConstants = {
  USER: {
    SUCCESS_READ_200: '사용자 목록을 성공적으로 조회했습니다.',
    SUCCESS_UPDATE_200: '사용자 정보를 성공적으로 수정했습니다.',
    SUCCESS_DELETE_200: '사용자 정보를 성공적으로 삭제했습니다.',
    SUCCESS_201: '사용자 정보를 성공적으로 등록했습니다.',
    NOT_FOUND_404: '사용자를 찾을 수 없습니다.',
    CONFLICT_409: '이미 존재하는 사용자입니다.',
  },
  AUTH: {
    SUCCESS_LOGIN_201: '로그인에 성공했습니다.',
    SUCCESS_LOGOUT_201: '로그아웃에 성공했습니다.',
    SUCCESS_TOKEN_201: '토큰을 성공적으로 발급되었습니다.',
    INVALID_ACCESS_TOKEN_401: '액세스 토큰이 유효하지 않습니다.',
    INVALID_REFRESH_TOKEN_401: '리프레시 토큰이 유효하지 않습니다.',
  },
  ROBOT: {
    SUCCESS_READ_200: '로봇 목록을 성공적으로 조회했습니다.',
    SUCCESS_UPDATE_200: '로봇 정보를 성공적으로 수정했습니다.',
    SUCCESS_DELETE_200: '로봇 정보를 성공적으로 삭제했습니다.',
    SUCCESS_201: '로봇 정보를 성공적으로 등록했습니다.',
    NOT_FOUND_404: '로봇을 찾을 수 없습니다.',
    CONFLICT_409: '이미 존재하는 로봇입니다.',
  },
  NETWORK:{
    SUCCESS_CONNECT_200: '성공적으로 연결했습니다.',
    FAIL_CONNECT_500: '연결에 실패했습니다.',
    FAIL_CONNECT_PASSWORD_400: '패스워드가 틀려 연결에 실패했습니다.',
    SUCCESS_UPDATE_200: '성공적으로 수정했습니다.',
    FAIL_UPDATE_500: '수정에 실패했습니다',
    NOT_FOUND_404: '요청한 내용을 찾을 수 없습니다.'
  },
  MOVE:{
    MOVE_ACCEPT_200: '이동 요청이 수락되었습니다',
    MOVE_REJECT_200: '이동 요청이 거절되었습니다',
    MOVE_PARAMETER_UNDIFINED_400: '이동 파라메타가 비어있습니다.'
  },
  MAPPING:{
    MAPPING_ACCEPT_200: '매핑 요청이 수락되었습니다',
    MAPPING_REJECT_200: '매핑 요청이 거절되었습니다',
    MAPPING_PARAMETER_UNDIFINED_400: '매핑 파라메터가 비어있습니다.'
  },
  DB:{
    SUCCESS_READ_LIST_200: '목록을 성공적으로 조회했습니다.',
    SUCCESS_READ_200: '성공적으로 데이터베이스를 조회했습니다.',
    SUCCESS_WRITE_201: '성공적으로 데이터베이스에 저장했습니다.',
    SUCCESS_DELETE_200: '성공적으로 데이터베이스에서 삭제했습니다.',
    NOT_FOUND_404: '해당하는 데이터를 찾을 수 없습니다.'
  },
  TASK: {
    SUCCESS_READ_LIST_200: '태스크 목록을 성공적으로 조회했습니다.',
    SUCCESS_READ_200: '태스크를 성공적으로 조회했습니다.',
    SUCCESS_UPDATE_200: '태스크를 성공적으로 수정했습니다.',
    SUCCESS_DELETE_200: '태스크를 성공적으로 삭제했습니다.',
    SUCCESS_201: '태스크를 성공적으로 저장했습니다.',
    NOT_FOUND_404: '맵을 찾을 수 없습니다.',
  },
  FILE:{
    SUCCESS_READ_LIST_200: '목록을 성공적으로 조회했습니다.',
    SUCCESS_READ_200: '파일을 성공적으로 조회했습니다.',
    SUCCESS_WRITE_201: '파일을 성공적으로 저장했습니다.',
    SUCCESS_DELETE_200: '파일을 성공적으로 삭제했습니다.',
    NOT_FOUND_404: '파일을 찾을 수 없습니다.',
    FAIL_READ_500: '파일을 읽는 도중 에러가 발생했습니다.',
    FAIL_WRITE_500: '파일을 쓰는 도중 에러가 발생했습니다.',
    FAIL_DELETE_500: '파일을 삭제 도중 에러가 발생했습니다.',
    DUPLICATE_WRITE: '파일이 이미 존재합니다.'
  },
  MAP: {
    SUCCESS_READ_LIST_200: '맵 목록을 성공적으로 조회했습니다.',
    SUCCESS_READ_200: '맵을 성공적으로 조회했습니다.',
    SUCCESS_UPDATE_200: '맵을 성공적으로 수정했습니다.',
    SUCCESS_DELETE_200: '맵을 성공적으로 삭제했습니다.',
    SUCCESS_201: '맵을 성공적으로 저장했습니다.',
    NOT_FOUND_404: '맵을 찾을 수 없습니다.',
  },
  /* TODO: 동적으로 문구 수정되게 변경 */
  SUCCESS_READ_200: '목록을 성공적으로 조회했습니다.',
  SUCCESS_201: '정보를 성공적으로 등록했습니다.',
  SUCCESS_UPDATE_200: '정보를 성공적으로 수정했습니다.',
  SUCCESS_DELETE_200: '정보를 성공적으로 삭제했습니다.',
  INVALID_DATA_400: '제공된 데이터가 유효하지 않습니다.',
  INVALID_USER_401: '유효하지 않은 사용자입니다.',
  INVALID_CREDENTIALS_401: '자격 증명이 유효하지 않습니다.',
  NOT_FOUND_404: '정보를 찾을 수 없습니다',
  CONFLICT_409: '이미 존재하는 데이터입니다.',
  INTERNAL_SERVER_ERROR_500:
    '서버에서 오류가 발생했습니다. 관리자에게 문의해주세요.',
};
