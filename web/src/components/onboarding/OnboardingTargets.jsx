/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/
import { useEffect, useMemo, useRef } from 'react';

import {
  useOnboarding,
  useOnboardingScope,
} from '../../hooks/useOnboarding';

const TARGET_SELECTORS = {
  header_home_nav: 'a[href="/"]',
  header_model_market: 'a[href="/pricing"]',
  mobile_console_menu_button: '[data-sidebar="trigger"]',
  sidebar_token_management: 'a[href="/keys"]',
  sidebar_usage_logs: 'a[href="/usage-logs"]',
  sidebar_invite_rewards: 'a[href="/wallet"]',
  tokens_mobile_actions_toggle: 'a[href="/keys"]',
  add_token_basics: '[data-slot="sheet-content"] form',
};

export function OnboardingTargets() {
  const { registerTarget, unregisterTarget } = useOnboarding();
  const registeredRef = useRef({});
  const guides = useMemo(
    () => [
      {
        id: 'header_home_nav',
        title: '首页设置教程',
        description: '使用教程、售后群号、充值额度方式等都在首页，必看哦！',
        placement: 'bottom',
        priority: 1000,
        maxWidth: 380,
      },
      {
        id: 'header_model_market',
        title: '模型广场',
        description: '这里可以查到所有模型与具体价格，本站点1r=站内1额度。',
        placement: 'bottom',
        priority: 300,
        maxWidth: 360,
      },
      {
        id: 'mobile_console_menu_button',
        title: '点击后可查看其他数据页面',
        placement: 'bottom',
        priority: 200,
        maxWidth: 260,
      },
      {
        id: 'sidebar_token_management',
        title: '令牌管理',
        description: '添加令牌获取密码钥匙，来调用模型。',
        placement: 'right',
        maxWidth: 340,
      },
      {
        id: 'sidebar_usage_logs',
        title: '使用日志',
        description:
          '可以查看到你调用 API 相关记录，报错不扣费。生成失败会有具体报错记录。',
        placement: 'right',
        maxWidth: 360,
      },
      {
        id: 'sidebar_invite_rewards',
        title: '邀请奖励',
        description:
          '该页面有专属邀请链接。邀请用户可获得额度奖励，请勿注册多个小号刷奖励。',
        placement: 'right',
        maxWidth: 380,
      },
      {
        id: 'tokens_mobile_actions_toggle',
        title: '如何创建令牌',
        description: '进入令牌管理后点击添加按钮创建令牌。',
        placement: 'bottom',
        maxWidth: 280,
      },
      {
        id: 'add_token_basics',
        title: '如何创建令牌',
        description:
          '令牌名称随意填写，勾选无限额度。分组按需求选择，但一定要选择。',
        placement: 'right',
        maxWidth: 360,
      },
    ],
    [],
  );

  useOnboardingScope(guides);

  useEffect(() => {
    const syncTargets = () => {
      Object.entries(TARGET_SELECTORS).forEach(([targetId, selector]) => {
        const nextNode = document.querySelector(selector);
        const previousNode = registeredRef.current[targetId];
        if (previousNode === nextNode) return;
        if (previousNode) unregisterTarget(targetId, previousNode);
        if (nextNode) registerTarget(targetId, nextNode);
        registeredRef.current[targetId] = nextNode;
      });
    };

    syncTargets();
    const observer = new MutationObserver(syncTargets);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', syncTargets);

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', syncTargets);
      Object.entries(registeredRef.current).forEach(([targetId, node]) => {
        if (node) unregisterTarget(targetId, node);
      });
      registeredRef.current = {};
    };
  }, [registerTarget, unregisterTarget]);

  return null;
}
