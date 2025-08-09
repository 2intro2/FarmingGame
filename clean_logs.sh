#!/bin/bash

# 创建备份
cp project/js/pages/ToolAssemblyNavPage.js project/js/pages/ToolAssemblyNavPage.js.backup

# 使用awk删除日志块，保持代码结构完整
awk '
BEGIN { in_logger_block = 0; brace_count = 0 }
/if \(GameGlobal\.logger\) \{/ {
    in_logger_block = 1
    brace_count = 1
    next
}
in_logger_block {
    for (i = 1; i <= length($0); i++) {
        char = substr($0, i, 1)
        if (char == "{") brace_count++
        if (char == "}") brace_count--
    }
    if (brace_count == 0) {
        in_logger_block = 0
    }
    next
}
!in_logger_block { print }
' project/js/pages/ToolAssemblyNavPage.js.backup > project/js/pages/ToolAssemblyNavPage.js.temp

mv project/js/pages/ToolAssemblyNavPage.js.temp project/js/pages/ToolAssemblyNavPage.js

echo "日志清理完成"