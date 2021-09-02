/**
 *
 *
 * @author: blukassen
 */

// create Provider
const TESTAPP = {
    namespace: "testapp",
    galaxies: ["stuff"],
    keys: {
        "pub": "8Rd9_YyQC6wfvJfevILdNUrqqJD32FwiOlk_InbgnZU.shWJNXxB7eNkBGxeQM9L6lDOnJc-_nO04vBn_giLQSs",
        "priv": "0WpQyGAkoCYt5B4n884WmK9mVI4AGMKDMsZdQwNRW6g",
        "epub": "72_OmxVivQZSqfBdnhSCXK9Ub8_VysdXTEO12IkV-jI.D6a7-RwEtdHSM_QhUSPQ9Bp5T7pUrzLKZsTioOqZG8U",
        "epriv": "xseS_H5PGRGErp5-zajsvJUfBIKH6MXXbjr_q8o3JpA"
    },
}

// create an Identity and Strangeness
const TESTIDENTITY = {
    alias: 'testuser',
    keys : {
        "pub": "qnCz27cOAl7OwsdP0-jwot0g61R90KEdZWd0474ELxo.YVFuMtKEf4Vj2yVGZZteDYP2MKN75TxdfD-2r5DFLUc",
        "priv": "gn4ggJx4U6pn_JClJJfHHtr2vtRIs7u0nWEnFjigdLQ",
        "epub": "wsU2aBqVY0DVPugBwu5mkOmgyXnXlXLgFZDQ3izUAR0.q-O3fI54iIi8hDwvV6WMMbiwUw31IciqYLtpbjU5tVA",
        "epriv": "6s8AHkxBSzDRTH9TwBRJkR3DojY_ZeCvUHKKffLUWgQ"
    }
};

universe.atDawn(async universe => {
    // register credentials for testing
    universe.archetim.useContext(TESTAPP, TESTIDENTITY);
})

