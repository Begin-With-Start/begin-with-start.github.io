/**
 * 
 */
(function(global) {

    global.Constant = {
        qrImgToken: 'qrImgToken=Y', // 在url中拼接的query，用于标识是动态二维码链接
        defaultAvatar: amc.path + 'alipay_msp_user',
        // 1. 校验输入合法性
        // 对输入值进行正则校验
        // 最多输入99999999.99
        validInputReg: '^(([1-9]{1}\\d{0,7})|([0]{1}))(\\.(\\d){0,2})?$', //匹配金额（小数点后最多2位）
        // 输入金额不能超过1亿
        exceedLimitReg: /^\d{8}/,

        // 结算状态
        OUT_TRADENO_MAP: {
            'TQP': '1', // 收钱码
            'C2C': '4', // C2C
            'RAILWAY': 'MR001' // 铁路
        },

        // 门店码的外部交易号前置编码
        SHOP_OUT_TRADENO_MAP: {
            SHOP: '7'
        },

        // 静态码限额的详情地址
        EXCEED_URL: 'https://csmobile.alipay.com/detailSolution.htm?knowledgeType=1&scene=app_cpgg_zhishidian&questionId=201602274087'
    };
})(window);