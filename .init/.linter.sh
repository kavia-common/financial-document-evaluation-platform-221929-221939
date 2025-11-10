#!/bin/bash
cd /home/kavia/workspace/code-generation/financial-document-evaluation-platform-221929-221939/financial_evaluation_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

