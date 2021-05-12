import Layout from '@/layout/layout';

const operationsRouter = {
  path: '/operation',
  component: Layout,
  redirect: '/operation/server',
  alwaysShow: true,
  name: 'Operation',
  meta: { title: '运维管理', icon: 'operation' },
  children: [
    {
      path: 'server',
      component: () => import('@/views/operation/server'),
      name: 'Server',
      meta: { title: '服务器', icon: 'server' }
    },
    {
      path: 'app',
      component: () => import('@/views/operation/app'),
      name: 'App',
      meta: { title: '应用管理', icon: 'app' }
    },
    {
      path: 'deploy',
      component: () => import('@/views/operation/deploy'),
      name: 'Deploy',
      meta: { title: '部署管理', icon: 'deploy' }
    },
    {
      path: 'deployHistory',
      component: () => import('@/views/operation/deploy-history'),
      name: 'DeployHistory',
      meta: { title: '部署备份', icon: 'deployHistory' }
    },
    {
      path: 'database',
      component: () => import('@/views/operation/database'),
      name: 'Database',
      meta: { title: '数据库管理', icon: 'database' }
    }
  ]
};

export default operationsRouter;
