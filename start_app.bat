@echo off
start cmd /k "cd /d U:\taher_ajel\backend && yarn start"
timeout /t 10
start cmd /k "cd /d U:\taher_ajel\front && npm run dev"
