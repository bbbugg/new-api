/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'

import { SettingsSection } from '../components/settings-section'

type MatchType = 'content' | 'status_code' | 'status_code_and_content'

type ErrorReplaceRule = {
  id: number
  name: string
  enabled: boolean
  match_type: MatchType
  status_code: number
  pattern: string
  replacement_message: string
  priority: number
}

type RuleForm = Omit<ErrorReplaceRule, 'id'>

const EMPTY_FORM: RuleForm = {
  name: '',
  enabled: true,
  match_type: 'content',
  status_code: 500,
  pattern: '',
  replacement_message: '',
  priority: 0,
}

export function ErrorReplaceSection() {
  const { t } = useTranslation()
  const [rules, setRules] = useState<ErrorReplaceRule[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState<RuleForm>(EMPTY_FORM)

  const loadRules = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/error-replace-rule/', {
        params: { p: 1, page_size: 100 },
        disableDuplicate: true,
      } as Record<string, unknown>)
      if (!res.data.success) throw new Error(res.data.message)
      setRules(res.data.data?.items ?? [])
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('获取错误替换规则失败')
      )
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadRules()
  }, [loadRules])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setDialogOpen(true)
  }

  const openEdit = (rule: ErrorReplaceRule) => {
    const { id, ...values } = rule
    setEditingId(id)
    setForm(values)
    setDialogOpen(true)
  }

  const saveRule = async () => {
    const needsStatus = form.match_type !== 'content'
    const needsPattern = form.match_type !== 'status_code'
    if (!form.name.trim()) return toast.error(t('请输入规则名称'))
    if (needsStatus && (form.status_code < 100 || form.status_code > 599)) {
      return toast.error(t('请输入合法的状态码'))
    }
    if (needsPattern && !form.pattern.trim()) {
      return toast.error(t('请输入匹配模式'))
    }
    if (!form.replacement_message.trim()) {
      return toast.error(t('请输入替换消息'))
    }

    try {
      const res =
        editingId == null
          ? await api.post('/api/error-replace-rule/', form)
          : await api.put(`/api/error-replace-rule/${editingId}`, form)
      if (!res.data.success) throw new Error(res.data.message)
      toast.success(t(editingId == null ? '创建成功' : '更新成功'))
      setDialogOpen(false)
      await loadRules()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('更新失败'))
    }
  }

  const toggleRule = async (rule: ErrorReplaceRule, enabled: boolean) => {
    try {
      const res = await api.put(`/api/error-replace-rule/${rule.id}`, {
        ...rule,
        enabled,
      })
      if (!res.data.success) throw new Error(res.data.message)
      await loadRules()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('更新失败'))
    }
  }

  const deleteRule = async () => {
    if (deleteId == null) return
    try {
      const res = await api.delete(`/api/error-replace-rule/${deleteId}`)
      if (!res.data.success) throw new Error(res.data.message)
      toast.success(t('删除成功'))
      setDeleteId(null)
      await loadRules()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('删除失败'))
    }
  }

  const showStatus = form.match_type !== 'content'
  const showPattern = form.match_type !== 'status_code'

  return (
    <SettingsSection title={t('错误替换规则')}>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-muted-foreground text-sm'>
          {t('按状态码或错误内容替换返回给普通用户的错误消息')}
        </p>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => void loadRules()}>
            <RefreshCw className='mr-2 size-4' />
            {t('刷新')}
          </Button>
          <Button onClick={openCreate}>
            <Plus className='mr-2 size-4' />
            {t('添加规则')}
          </Button>
        </div>
      </div>
      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('名称')}</TableHead>
              <TableHead>{t('启用')}</TableHead>
              <TableHead>{t('匹配类型')}</TableHead>
              <TableHead>{t('状态码')}</TableHead>
              <TableHead>{t('匹配模式')}</TableHead>
              <TableHead>{t('替换消息')}</TableHead>
              <TableHead>{t('优先级')}</TableHead>
              <TableHead className='text-right'>{t('操作')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>{rule.name}</TableCell>
                <TableCell>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(checked) =>
                      void toggleRule(rule, checked)
                    }
                  />
                </TableCell>
                <TableCell>{t(rule.match_type)}</TableCell>
                <TableCell>{rule.status_code || '-'}</TableCell>
                <TableCell className='max-w-52 truncate'>
                  {rule.pattern || '-'}
                </TableCell>
                <TableCell className='max-w-64 truncate'>
                  {rule.replacement_message}
                </TableCell>
                <TableCell>{rule.priority}</TableCell>
                <TableCell>
                  <div className='flex justify-end gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => openEdit(rule)}
                    >
                      <Pencil className='size-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setDeleteId(rule.id)}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rules.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className='py-8 text-center'>
                  {t('暂无数据')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(editingId == null ? '添加错误替换规则' : '编辑错误替换规则')}
            </DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-2'>
            <div className='grid gap-2'>
              <Label>{t('规则名称')}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className='flex items-center justify-between'>
              <Label>{t('启用')}</Label>
              <Switch
                checked={form.enabled}
                onCheckedChange={(enabled) => setForm({ ...form, enabled })}
              />
            </div>
            <div className='grid gap-2'>
              <Label>{t('匹配类型')}</Label>
              <Select
                value={form.match_type}
                onValueChange={(match_type) =>
                  setForm({ ...form, match_type: match_type as MatchType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='content'>{t('内容')}</SelectItem>
                  <SelectItem value='status_code'>{t('状态码')}</SelectItem>
                  <SelectItem value='status_code_and_content'>
                    {t('状态码+内容')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showStatus && (
              <div className='grid gap-2'>
                <Label>{t('状态码')}</Label>
                <Input
                  type='number'
                  min={100}
                  max={599}
                  value={form.status_code}
                  onChange={(e) =>
                    setForm({ ...form, status_code: Number(e.target.value) })
                  }
                />
              </div>
            )}
            {showPattern && (
              <div className='grid gap-2'>
                <Label>{t('匹配模式')}</Label>
                <Textarea
                  value={form.pattern}
                  onChange={(e) =>
                    setForm({ ...form, pattern: e.target.value })
                  }
                />
              </div>
            )}
            <div className='grid gap-2'>
              <Label>{t('替换消息')}</Label>
              <Textarea
                value={form.replacement_message}
                onChange={(e) =>
                  setForm({ ...form, replacement_message: e.target.value })
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label>{t('优先级')}</Label>
              <Input
                type='number'
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              {t('取消')}
            </Button>
            <Button onClick={() => void saveRule()}>
              {t(editingId == null ? '创建' : '更新')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId != null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('确定要删除该规则吗？')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('此操作无法撤销')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('取消')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void deleteRule()}>
              {t('删除')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  )
}
