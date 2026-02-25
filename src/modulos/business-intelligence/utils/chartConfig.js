// src/modulos/business-intelligence/utils/chartConfig.js

export const chartColors = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1'
};

export const chartTheme = {
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderColor: '#E2E8F0',
  textColor: '#64748B',
  gridColor: '#F1F5F9'
};

export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: chartTheme.textColor,
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: chartColors.primary,
      borderWidth: 1,
      cornerRadius: 8
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  }
};

export const lineChartConfig = {
  ...defaultChartOptions,
  scales: {
    x: {
      grid: {
        color: chartTheme.gridColor
      },
      ticks: {
        color: chartTheme.textColor
      }
    },
    y: {
      grid: {
        color: chartTheme.gridColor
      },
      ticks: {
        color: chartTheme.textColor
      }
    }
  }
};

export const barChartConfig = {
  ...defaultChartOptions,
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: chartTheme.textColor
      }
    },
    y: {
      grid: {
        color: chartTheme.gridColor
      },
      ticks: {
        color: chartTheme.textColor
      }
    }
  }
};

export const doughnutChartConfig = {
  ...defaultChartOptions,
  cutout: '60%',
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins.legend,
      position: 'bottom'
    }
  }
};
