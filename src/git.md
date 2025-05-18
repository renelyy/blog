# Git 的使用

## 常用命令

### 克隆、拉取、推送

1. 克隆远程仓库

```
git clone https://github.com/username/repo.git
```

2. 拉取远程仓库最新代码

```
git pull origin master
```

3. 推送本地代码到远程仓库

```
git push origin master
```

### git config 相关

1. 设置代理

```
git config --global http.proxy http://127.0.0.1:1080
git config --global https.proxy https://127.0.0.1:1080
```

2. 取消代理

```
git config --global --unset http.proxy
git config --global --unset https.proxy
```

3. 查看代理

```
git config --global --get http.proxy
git config --global --get https.proxy
```

4. 查看配置

```
git config --list
```

### git remote 相关

1. 查看远程仓库地址

```
git remote -v
```

2. 添加远程仓库地址

```
git remote add origin https://github.com/username/repo.git
```

3. 删除远程仓库地址

```
git remote remove origin
```

4. 修改远程仓库地址

```
git remote set-url origin https://github.com/username/repo.git
```

### git branch 相关

1. 查看本地分支

```
git branch
```

2. 查看远程分支

```
git branch -r
```

3. 查看所有分支（本地 + 远程）

```
git branch -a
```

4. 创建分支

```
git branch branch_name
```

5. 切换分支

```
git checkout branch_name
git switch branch_name
```

6. 合并分支（将 branch_name 分支合并到当前分支）

```
git merge branch_name
```

7. 删除分支

```
git branch -d branch_name
```

8. 强制删除分支

```
git branch -D branch_name
```

### git log 相关

18. 查看提交记录

```
git log
```

19. 查看当前分支的提交记录

```
git log --oneline
```

20. 查看当前分支的提交记录和修改记录

```
git log --oneline --stat
```

21. 查看当前分支的提交记录和修改记录，并显示作者和日期

```
git log --oneline --stat --author="username" --since="2021-01-01" --until="2021-12-31"
```

22. 查看当前分支的提交记录和修改记录，并显示作者和日期，并按照日期排序

```
git log --oneline --stat --author="username" --since="2021-01-01" --until="2021-12-31" --date=iso
```

23. 查看当前分支的提交记录和修改记录，并显示作者和日期，并按照日期排序，并按照提交次数排序

```
git log --oneline --stat --author="username" --since="2021-01-01" --until="2021-12-31" --date=iso --sort=-committerdate
```

### git reset 相关

1. 撤销提交但保留暂存状态（将提交到本地的代码回退到暂存区）

```
git reset --soft HEAD~1
```

2. 撤销提交并移除暂存，但保留工作区的修改（撤销暂存的更改（代码从暂存区 -> 更改））

```
git reset --mixed HEAD~1
```

3. 撤销提交并删除所有修改（完全放弃所有未提交的更改（工作目录 + 暂存区））

```
git reset --hard HEAD~1
```

4. 生成新提交来撤销指定的提交（将指定的提交回滚到上一个提交）

```
git revert <commit-hash>
```

5. 回退到指定提交并丢弃后续内容（将指定的提交回滚到初始状态）

```
git reset --hard <commit-hash>
```

### git stash 相关

1. 保存工作区修改到 stash

```
git stash
```

2. 保存工作区修改到 stash，包括未跟踪的文件

```
git stash push --include-untracked -m "注释"
git stash push -u -m "注释"
git stash save -u "注释"
```

3. 查看保存的 stash 列表

```
git stash list

```

4. 恢复并删除 stash

```
git stash pop
```

5. 恢复但不删除 stash

```
git stash apply
```

6. 删除 stash

```
git stash drop "stash@{2}" 删除指定的 stash
git stash drop 2 // 简写 Git2.11+ 支持
```

7. 清空 stash

```
git stash clear
```

8. 恢复指定的 stash 不删除

```
git stash apply stash@{0}
```

9. 恢复指定的 stash 并删除

```
git stash pop stash@{0}

```

### git checkout 相关

1. 将目标分支的目标目录下的所有内容迁出到当前分支

```
git checkout branch_name -- path/to/file
```

### git clean 相关

1. 清理未跟踪的文件

```
git clean -f
```

2. 清理未跟踪的文件和目录

```
git clean -df
```

3. 清理未跟踪的文件和目录，包括 .gitignore 中指定的文件

```
git clean -Xdf
```

4. 清理未跟踪的文件和目录，包括 .gitignore 中指定的文件和目录

```
git clean -xdf
```

### git cherry-pick 相关

1. 将指定的提交应用到当前分支

```
git cherry-pick <commit-hash>
```

2. 将指定的提交应用到当前分支，并保留提交信息

```
git cherry-pick -x <commit-hash>
```

3. 将指定的提交应用到当前分支，并保留提交信息，并合并冲突

```
git cherry-pick -x -m 1 <commit-hash>
```
