# Git 的使用

## 常用命令

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

5. 查看远程仓库地址

```
git remote -v
```

6. 添加远程仓库地址

```
git remote add origin https://github.com/username/repo.git
```

7. 删除远程仓库地址

```
git remote remove origin
```

8. 修改远程仓库地址

```
git remote set-url origin https://github.com/username/repo.git
```

9. 克隆远程仓库

```
git clone https://github.com/username/repo.git
```

10. 拉取远程仓库最新代码

```
git pull origin master
```

11. 推送本地代码到远程仓库

```
git push origin master
```

12. 查看分支

```
git branch
```

13. 创建分支

```
git branch branch_name
```

14. 切换分支

```
git checkout branch_name
```

15. 合并分支

```
git merge branch_name
```

16. 删除分支

```
git branch -d branch_name
```

17. 强制删除分支

```
git branch -D branch_name
```

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
