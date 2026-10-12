export const searchKnowledgeBaseTool = {
    type: 'function',
    function: {
        name: 'searchKnowledgeBase',
        description:
            'Tìm kiếm thông tin trong knowledge base của doanh nghiệp. Sử dụng tool này khi người dùng hỏi về chính sách, quy định, hướng dẫn, tài liệu hoặc thông tin nghiệp vụ không nằm trực tiếp trong dữ liệu đơn hàng.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description:
                        'Nội dung cần tìm kiếm trong knowledge base',
                },
            },
            required: ['query'],
        },
    },
};