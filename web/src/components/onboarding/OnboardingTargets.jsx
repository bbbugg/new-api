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
  sidebar_wallet_management: 'a[href="/wallet"]',
  sidebar_overview: '[data-sidebar="content"]',
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
        description:
          '如果不知道该如何配置 API，请从首页进入设置教程查看说明。',
        placement: 'bottom',
        priority: 1000,
        maxWidth: 380,
      },
      {
        id: 'header_model_market',
        title: '模型广场',
        description: '这里可以查看可用模型及对应价格。',
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
        description: '添加令牌后即可获取调用模型所需的密钥。',
        placement: 'right',
        maxWidth: 340,
      },
      {
        id: 'sidebar_usage_logs',
        title: '使用日志',
        description: '这里可以查看 API 调用记录和失败原因。',
        placement: 'right',
        maxWidth: 360,
      },
      {
        id: 'sidebar_wallet_management',
        title: '钱包管理',
        description: '这里可以充值额度并查看邀请奖励。',
        placement: 'right',
        maxWidth: 380,
      },
      {
        id: 'sidebar_overview',
        title: '其他页面',
        description: '侧边栏中的其他页面可以管理账户和系统数据。',
        placement: 'right',
        maxWidth: 320,
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
        description: '填写令牌名称、选择分组，并按需设置过期时间与额度。',
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
