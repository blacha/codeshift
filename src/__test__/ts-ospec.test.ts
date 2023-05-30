import o from 'ospec';

o.spec('Test Sepc', () => {
    o.before(() => {

    })
    o.after(() => { })
    o.afterEach(() => { })
    o.beforeEach(() => { })
    o('it should do something', async () => {
        const t = 'a'
        o(t.startsWith('a')).equals(false)
        o(!t.startsWith('a')).notEquals(false)
    })

    o.spec('Test Spec2', () => {
        o('it should test indedent', () => {
            o({ big: 'test' }).deepEquals({ big: 'test' })
        })
    })
})