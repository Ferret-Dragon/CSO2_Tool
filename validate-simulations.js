// Quick validation script for CSO2 Simulations
// This can be run in browser console to check basic functionality

function validateSimulations() {
    console.log('🔍 CSO2 Simulations Validation');
    console.log('=' .repeat(40));

    const issues = [];
    const successes = [];

    // Check 1: Required DOM elements exist
    const requiredElements = {
        'Build System': ['#project-box', '#build-btn', '#build-stages', '#modify-util-btn'],
        'Permissions': ['#filesystem', '#current-user', '#file-permissions'],
        'Signals': ['#process-output', '#restart-process', 'input[name="sigint-action"]'],
        'Network': ['.layer', '#send-message', '#introduce-errors'],
        'Cache': ['#cache-size', '#associativity', '#memory-pattern', '#run-cache'],
        'Threads': ['#thread-count', '#start-threads', '#shared-counter', '#use-mutex']
    };

    for (const [simulation, selectors] of Object.entries(requiredElements)) {
        let missing = [];
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length === 0) {
                missing.push(selector);
            }
        }

        if (missing.length === 0) {
            successes.push(`✅ ${simulation}: All elements found`);
        } else {
            issues.push(`❌ ${simulation}: Missing ${missing.join(', ')}`);
        }
    }

    // Check 2: JavaScript class exists
    if (typeof CSO2Simulations !== 'undefined') {
        successes.push('✅ CSO2Simulations class loaded');

        // Check key methods exist
        const sim = new CSO2Simulations();
        const keyMethods = [
            'animateSpecificBuildProcess',
            'checkSpecificPermission',
            'sendNetworkMessage',
            'runThreadSimulation'
        ];

        for (const method of keyMethods) {
            if (typeof sim[method] === 'function') {
                successes.push(`✅ Method ${method} exists`);
            } else {
                issues.push(`❌ Method ${method} missing`);
            }
        }
    } else {
        issues.push('❌ CSO2Simulations class not loaded');
    }

    // Check 3: CSS classes exist
    const requiredStyles = ['.simulation', '.nav-btn', '.build-step', '.layer', '.process-output'];
    for (const className of requiredStyles) {
        const elements = document.querySelectorAll(className);
        if (elements.length > 0) {
            successes.push(`✅ CSS class ${className} applied (${elements.length} elements)`);
        } else {
            issues.push(`❌ CSS class ${className} not found`);
        }
    }

    // Check 4: File items have proper data attributes
    const fileItems = document.querySelectorAll('.file-item');
    if (fileItems.length >= 4) {
        successes.push(`✅ Found ${fileItems.length} draggable file items`);

        const hasDataAttributes = Array.from(fileItems).every(item =>
            item.dataset.name && item.dataset.type
        );

        if (hasDataAttributes) {
            successes.push('✅ File items have required data attributes');
        } else {
            issues.push('❌ Some file items missing data attributes');
        }
    } else {
        issues.push('❌ Expected at least 4 file items for build system');
    }

    // Check 5: Network corruption fix
    const errorCheckbox = document.getElementById('introduce-errors');
    if (errorCheckbox) {
        successes.push('✅ Network error introduction control exists');
    } else {
        issues.push('❌ Network error control missing');
    }

    // Print results
    console.log('\n✅ SUCCESSES:');
    successes.forEach(success => console.log(success));

    if (issues.length > 0) {
        console.log('\n❌ ISSUES FOUND:');
        issues.forEach(issue => console.log(issue));
    }

    console.log('\n📊 SUMMARY:');
    console.log(`✅ Passed: ${successes.length}`);
    console.log(`❌ Issues: ${issues.length}`);
    console.log(`📈 Health: ${Math.round((successes.length / (successes.length + issues.length)) * 100)}%`);

    if (issues.length === 0) {
        console.log('\n🎉 All validations passed! Simulations are ready.');
    } else {
        console.log('\n⚠️ Some issues detected. Check the details above.');
    }

    return {
        successes: successes.length,
        issues: issues.length,
        details: { successes, issues }
    };
}

// Quick functional test
function quickFunctionalTest() {
    console.log('\n🧪 Quick Functional Tests');
    console.log('=' .repeat(25));

    const tests = [];

    // Test 1: Permission logic
    try {
        if (typeof CSO2Simulations !== 'undefined') {
            const sim = new CSO2Simulations();
            if (typeof sim.checkSpecificPermission === 'function') {
                const testFile = { name: 'test.txt', owner: 'alice', permissions: '600' };
                const bobAccess = sim.checkSpecificPermission(testFile, 'bob', 'read');
                const aliceAccess = sim.checkSpecificPermission(testFile, 'alice', 'read');

                if (!bobAccess.allowed && aliceAccess.allowed) {
                    tests.push('✅ Permission logic working correctly');
                } else {
                    tests.push('❌ Permission logic incorrect');
                }
            } else {
                tests.push('⚠️ Permission method not available');
            }
        }
    } catch (error) {
        tests.push(`❌ Permission test error: ${error.message}`);
    }

    // Test 2: Build system files
    try {
        const mainFile = document.querySelector('.file-item[data-name="main.c"]');
        const utilFile = document.querySelector('.file-item[data-name="util.c"]');
        const mathFile = document.querySelector('.file-item[data-name="math.c"]');

        if (mainFile && utilFile && mathFile) {
            tests.push('✅ Build system files present (main.c, util.c, math.c)');
        } else {
            tests.push('❌ Build system files incomplete');
        }
    } catch (error) {
        tests.push(`❌ Build system test error: ${error.message}`);
    }

    // Test 3: Network layers
    try {
        const layers = document.querySelectorAll('.layer');
        if (layers.length === 4) {
            const layerNames = Array.from(layers).map(layer =>
                layer.querySelector('h4')?.textContent || 'Unknown'
            );

            const expectedLayers = ['Application', 'Transport', 'Network', 'Link'];
            const hasAllLayers = expectedLayers.every(expected =>
                layerNames.some(name => name.includes(expected))
            );

            if (hasAllLayers) {
                tests.push('✅ Network layers complete (Application, Transport, Network, Link)');
            } else {
                tests.push(`❌ Network layers incomplete: ${layerNames.join(', ')}`);
            }
        } else {
            tests.push(`❌ Expected 4 network layers, found ${layers.length}`);
        }
    } catch (error) {
        tests.push(`❌ Network layers test error: ${error.message}`);
    }

    tests.forEach(test => console.log(test));

    const passed = tests.filter(t => t.startsWith('✅')).length;
    const total = tests.length;

    console.log(`\n📊 Functional Test Summary: ${passed}/${total} passed`);

    return { passed, total, tests };
}

// Auto-run if in browser console
if (typeof window !== 'undefined' && window.document) {
    console.log('CSO2 Validation Script Loaded');
    console.log('Run: validateSimulations() or quickFunctionalTest()');
}

// Export for Node.js testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateSimulations, quickFunctionalTest };
}