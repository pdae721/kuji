# AWS 배포 기록

- 대상: AWS 서울 리전 `ap-northeast-2`, 무료 플랜 계정.
- 방식: `deploy/ec2.yaml` CloudFormation, `deploy/bootstrap.sh` 초기화.
- 상태: **배포 완료 및 실제 HTTP 시험 통과** (2026-11-22, Asia/Seoul).
- 배포 주소: [http://43.203.143.246](http://43.203.143.246).
- 공개 DNS: [http://ec2-43-203-143-246.ap-northeast-2.compute.amazonaws.com](http://ec2-43-203-143-246.ap-northeast-2.compute.amazonaws.com).
- 상태 확인: [http://43.203.143.246/api/health](http://43.203.143.246/api/health) → `200 {"status":"ok","service":"KUJI POP API"}`.
- 앱 배포 커밋: `1e665a3fff6316ec49416acb07a4badbd168077b`.
- 스택: `kuji-pop-demo`, 상태 `CREATE_COMPLETE`.
- 서버: EC2 `t3.micro` 1대, Amazon Linux 2023, gp3 암호화 EBS 8 GiB.
- 공개 포트: HTTP 80. SSH 22·백엔드 8000은 외부 미개방.
- CloudFront·ELB·Auto Scaling·NAT Gateway·Elastic IP·새 IAM 역할은 생성하지 않음.

무료 플랜은 크레딧으로 사용 비용을 충당하며, 플랜 종료 또는 크레딧 소진 시 서비스가 종료될 수 있습니다. 유료 플랜으로 전환하지 않았습니다. 영구 무료라는 뜻은 아닙니다.

## 실제 배포 검증

`python scripts/verify_deployment.py http://43.203.143.246 --draw --executor Codex --output docs/evidence/deployment-http.json` 실행: **12/12개 확인 통과**.

| 입력 | 실제 결과 |
|---|---|
| `GET /api/health` | 200, `status: ok` |
| `GET /api/kuji` | 200, 상품 3개 |
| `GET /api/kuji/happy-drive` | 200, 상품 이미지·4종 경품·재고 |
| `GET /api/kuji/not-a-product` | 404, 존재하지 않는 상품 안내 |
| 추첨 `count:2` | 409, 허용 횟수 안내 |
| 추첨 `count:11` | 422, 입력 범위 검증 |
| 실패 요청 전후 재고 | 23 → 23, 변경 없음 |
| 승인된 정상 추첨 `count:1` | 200, 경품 1개, 저장 재고 23 → 22 |

실제 입력과 전체 응답은 [deployment-http.json](evidence/deployment-http.json)에 저장했습니다. 정상 추첨은 사용자가 데모 재고 1개 차감을 명시적으로 승인한 뒤 **정확히 한 번** 실행했습니다. 추가 실제 추첨을 자동 반복하지 않았습니다.

검색·확률은 실제 배포 API 데이터와 SHA-256이 일치하는 배포 JavaScript를 사용해 정상·경계 **7/7건**을 CLI로 확인했습니다. 상품 이미지 **18/18개**도 HTTP 200입니다. [입력·결과 및 JS 해시](evidence/deployment-logic.json)와 [AWS 스택 출력·공개 주소 화면](evidence/aws-stack.jpg)을 함께 보관합니다. 화면 캡처에는 계정 정보가 있는 상단 내비게이션을 제외했습니다.

앱 내 브라우저는 공개 HTTP 주소를 `ERR_BLOCKED_BY_CLIENT`로 차단해 배포 주소의 화면 캡처를 남기지 못했습니다. 정상·실패 API 실행은 공인 주소에 직접 HTTP로 수행했으며, 로컬 화면을 AWS 화면으로 표시하지 않았습니다. 사용자는 HTTPS 추가 대신 현재 HTTP 주소로 완료하도록 선택했습니다. 일반 브라우저에서 배포 주소를 열어 검색·확률·추첨을 직접 실행하고 `VALIDATION.md`의 직접 실행 표에 기록할 수 있습니다.

저장소의 후속 문서·증거 커밋과 앱 배포 커밋을 구분합니다. 재현 시 위 앱 커밋의 코드를 사용합니다. 서버 중지·시작 시 자동 공인 IP가 변경될 수 있습니다.
