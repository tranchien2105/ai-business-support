export const getOrderStatusTool = {
  type: 'function',

  function: {
    name: 'getOrderStatus',

    description:
      'Get the real current status of an order from the business system. Use this tool when the user asks about the status of a specific order. Never invent the status.',

    parameters: {
      type: 'object',

      properties: {
        orderNumber: {
          type: 'string',
          description:
            'The order number, for example ORD-10001.',
        },
      },

      required: ['orderNumber'],
    },
  },
};

export const getOrderTool = {
  type: 'function',

  function: {
    name: 'getOrder',

    description:
      'Get the real order information from the business system. Use this tool whenever the user asks for details about a specific order. Never invent order information.',

    parameters: {
      type: 'object',

      properties: {
        orderNumber: {
          type: 'string',
          description:
            'The order number, for example ORD-10001.',
        },
      },

      required: ['orderNumber'],
    },
  },
};

export const getOrderCountByStatusTool = {
  type: 'function',

  function: {
    name: 'getOrderCountByStatus',

    description:
      'Get the number of orders with a specific status from the business system. Use this tool when the user asks how many orders have a particular status.',

    parameters: {
      type: 'object',

      properties: {
        status: {
          type: 'string',
          enum: [
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'SHIPPING',
            'COMPLETED',
            'CANCELLED',
          ],
          description:
            'The order status to count.',
        },
      },

      required: ['status'],
    },
  },
};

export const getOrderCountTodayTool = {
  type: 'function',

  function: {
    name: 'getOrderCountToday',

    description:
      'Get the number of orders created today from the business system. Use this tool when the user asks how many orders were created today.',

    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
};

export const getOrderCountByDateRangeTool = {
  type: 'function',

  function: {
    name: 'getOrderCountByDateRange',

    description:
      'Get the number of orders created within a specific date and time range. Use this tool when the user provides exact dates or an exact date range.',

    parameters: {
      type: 'object',

      properties: {
        from: {
          type: 'string',
          description:
            'Start of the date range in ISO 8601 format.',
        },

        to: {
          type: 'string',
          description:
            'End of the date range in ISO 8601 format.',
        },
      },

      required: ['from', 'to'],
    },
  },
};

export const getOrderCountByPeriodTool = {
  type: 'function',

  function: {
    name: 'getOrderCountByPeriod',

    description:
      'Get the number of orders created during a relative time period. Use this tool for questions such as today or yesterday. Do not calculate or provide exact dates yourself.',

    parameters: {
      type: 'object',

      properties: {
        period: {
          type: 'string',

          enum: [
            'today',
            'yesterday',
          ],

          description:
            'The relative time period to query.',
        },
      },

      required: ['period'],
    },
  },
};