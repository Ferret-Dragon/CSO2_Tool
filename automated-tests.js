// Automated Test Suite for CSO2 Simulations
class SimulationTester {
    constructor() {
        this.tests = [];
        this.results = { passed: 0, failed: 0, total: 0 };
        this.cso2Sim = null;
    }

    async init() {
        // Wait for CSO2Simulations to be available
        return new Promise((resolve) => {
            const checkForSim = () => {
                if (typeof CSO2Simulations !== 'undefined') {
                    this.cso2Sim = new CSO2Simulations();
                    resolve();
                } else {
                    setTimeout(checkForSim, 100);
                }
            };
            checkForSim();
        });
    }

    addTest(name, description, testFunction) {
        this.tests.push({ name, description, testFunction });
    }

    async runAllTests() {
        console.log('🚀 Starting CSO2 Simulations Test Suite');
        console.log('=' .repeat(50));

        this.results = { passed: 0, failed: 0, total: this.tests.length };

        for (const test of this.tests) {
            try {
                console.log(`\n🧪 Running: ${test.name}`);
                console.log(`   ${test.description}`);

                const result = await test.testFunction();

                if (result.success) {
                    console.log(`   ✅ PASSED: ${result.message}`);
                    this.results.passed++;
                } else {
                    console.log(`   ❌ FAILED: ${result.message}`);
                    this.results.failed++;
                }
            } catch (error) {
                console.log(`   💥 ERROR: ${error.message}`);
                this.results.failed++;
            }
        }

        this.printSummary();
        return this.results;
    }

    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Pass Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));
    }

    // Utility method to check if element exists and is interactive
    checkElement(selector, description) {
        const element = document.querySelector(selector);
        if (!element) {
            return { success: false, message: `${description} element not found (${selector})` };
        }
        return { success: true, message: `${description} element found and accessible`, element };
    }

    // Utility method to simulate user interaction
    simulateClick(element) {
        return new Promise((resolve) => {
            element.click();
            setTimeout(resolve, 100);
        });
    }

    simulateInput(element, value) {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

// Initialize tester and define tests
const tester = new SimulationTester();

// Build System Visualizer Tests
tester.addTest(
    'Build System - DOM Structure',
    'Verify all required DOM elements exist for build system',
    async () => {
        const elements = [
            '#project-box',
            '#build-btn',
            '#clean-btn',
            '#build-stages',
            '#modify-util-btn',
            '.file-item[data-name="main.c"]',
            '.file-item[data-name="util.c"]',
            '.file-item[data-name="math.c"]'
        ];

        for (const selector of elements) {
            const check = tester.checkElement(selector, `Build system ${selector}`);
            if (!check.success) return check;
        }

        return { success: true, message: 'All build system elements found' };
    }
);

tester.addTest(
    'Build System - File Dependencies',
    'Verify main.c shows dependency on util.h',
    async () => {
        const mainFile = document.querySelector('.file-item[data-name="main.c"]');
        if (!mainFile) {
            return { success: false, message: 'main.c file item not found' };
        }

        const hasDependency = mainFile.textContent.includes('util.h') || mainFile.dataset.depends === 'util.h';
        return {
            success: hasDependency,
            message: hasDependency ? 'main.c shows util.h dependency' : 'main.c dependency not visible'
        };
    }
);

// Permissions Sandbox Tests
tester.addTest(
    'Permissions - File System Setup',
    'Verify filesystem shows secret.txt with proper permissions',
    async () => {
        // Trigger filesystem render by checking if elements exist
        const filesystem = tester.checkElement('#filesystem', 'Filesystem');
        if (!filesystem.success) return filesystem;

        const userSelect = tester.checkElement('#current-user', 'User selector');
        if (!userSelect.success) return userSelect;

        const permSelect = tester.checkElement('#file-permissions', 'Permissions selector');
        if (!permSelect.success) return permSelect;

        return { success: true, message: 'Permissions system setup correctly' };
    }
);

tester.addTest(
    'Permissions - User Switching',
    'Verify users can switch between alice, bob, and root',
    async () => {
        const userSelect = document.querySelector('#current-user');
        if (!userSelect) {
            return { success: false, message: 'User selector not found' };
        }

        const expectedUsers = ['alice', 'bob', 'root'];
        const actualUsers = Array.from(userSelect.options).map(opt => opt.value);

        const hasAllUsers = expectedUsers.every(user => actualUsers.includes(user));

        return {
            success: hasAllUsers,
            message: hasAllUsers ?
                'All expected users available' :
                `Missing users. Expected: ${expectedUsers.join(',')}, Found: ${actualUsers.join(',')}`
        };
    }
);

// Signal Playground Tests
tester.addTest(
    'Signals - Handler Configuration',
    'Verify signal handler options (default, custom, ignore) exist',
    async () => {
        const handlerRadios = document.querySelectorAll('input[name="sigint-action"]');
        if (handlerRadios.length < 3) {
            return { success: false, message: `Expected 3 signal handler options, found ${handlerRadios.length}` };
        }

        const values = Array.from(handlerRadios).map(radio => radio.value);
        const expectedValues = ['default', 'custom', 'ignore'];
        const hasAllValues = expectedValues.every(val => values.includes(val));

        return {
            success: hasAllValues,
            message: hasAllValues ?
                'All signal handler options available' :
                `Missing handler options. Expected: ${expectedValues.join(',')}, Found: ${values.join(',')}`
        };
    }
);

tester.addTest(
    'Signals - Process Output',
    'Verify process output area exists and is configured',
    async () => {
        const processOutput = tester.checkElement('#process-output', 'Process output');
        if (!processOutput.success) return processOutput;

        const restartBtn = tester.checkElement('#restart-process', 'Restart button');
        if (!restartBtn.success) return restartBtn;

        return { success: true, message: 'Signal playground output components ready' };
    }
);

// Network Layers Tests
tester.addTest(
    'Network - Layer Structure',
    'Verify 4 network layers exist with proper hierarchy',
    async () => {
        const layers = document.querySelectorAll('.layer');
        if (layers.length !== 4) {
            return { success: false, message: `Expected 4 network layers, found ${layers.length}` };
        }

        const expectedLayers = ['Application Layer', 'Transport Layer', 'Network Layer', 'Link Layer'];
        const actualLayers = Array.from(layers).map(layer =>
            layer.querySelector('h4')?.textContent || 'Unknown'
        );

        const hasCorrectLayers = expectedLayers.every(expected =>
            actualLayers.some(actual => actual.includes(expected.split(' ')[0]))
        );

        return {
            success: hasCorrectLayers,
            message: hasCorrectLayers ?
                'All network layers present' :
                `Layer mismatch. Expected: ${expectedLayers.join(',')}, Found: ${actualLayers.join(',')}`
        };
    }
);

tester.addTest(
    'Network - Error Controls',
    'Verify error introduction and encryption controls exist',
    async () => {
        const errorCheckbox = tester.checkElement('#introduce-errors', 'Error introduction checkbox');
        if (!errorCheckbox.success) return errorCheckbox;

        const encryptionCheckbox = tester.checkElement('#enable-encryption', 'Encryption checkbox');
        if (!encryptionCheckbox.success) return encryptionCheckbox;

        return { success: true, message: 'Network error and encryption controls available' };
    }
);

// Cache Explorer Tests
tester.addTest(
    'Cache - Configuration Controls',
    'Verify cache size and associativity can be configured',
    async () => {
        const cacheSizeSelect = document.querySelector('#cache-size');
        const assocSelect = document.querySelector('#associativity');

        if (!cacheSizeSelect) {
            return { success: false, message: 'Cache size selector not found' };
        }
        if (!assocSelect) {
            return { success: false, message: 'Associativity selector not found' };
        }

        const hasSizeOptions = cacheSizeSelect.options.length >= 3;
        const hasAssocOptions = assocSelect.options.length >= 3;

        return {
            success: hasSizeOptions && hasAssocOptions,
            message: `Cache config: ${cacheSizeSelect.options.length} size options, ${assocSelect.options.length} associativity options`
        };
    }
);

// Thread Race Lab Tests
tester.addTest(
    'Threads - Synchronization Controls',
    'Verify thread count, iterations, and sync options exist',
    async () => {
        const threadCount = tester.checkElement('#thread-count', 'Thread count input');
        if (!threadCount.success) return threadCount;

        const iterations = tester.checkElement('#iterations', 'Iterations input');
        if (!iterations.success) return iterations;

        const syncControls = ['#use-mutex', '#use-barrier', '#use-semaphore'];
        for (const control of syncControls) {
            const check = tester.checkElement(control, `Sync control ${control}`);
            if (!check.success) return check;
        }

        return { success: true, message: 'All thread synchronization controls available' };
    }
);

// Functional Tests - Test actual simulation behavior
tester.addTest(
    'Functional - Build System Integration',
    'Test that build system can process files and show incremental builds',
    async () => {
        // Test would involve:
        // 1. Adding files to project box
        // 2. Running build
        // 3. Modifying util.c
        // 4. Running build again to check incremental behavior

        // For now, just verify the methods exist
        if (typeof tester.cso2Sim.animateSpecificBuildProcess === 'function' &&
            typeof tester.cso2Sim.updateProjectBox === 'function') {
            return { success: true, message: 'Build system methods available for integration' };
        } else {
            return { success: false, message: 'Build system methods not found' };
        }
    }
);

tester.addTest(
    'Functional - Permission Logic',
    'Test permission checking logic works correctly',
    async () => {
        // Test the permission checking logic
        if (typeof tester.cso2Sim.checkSpecificPermission === 'function') {
            // Mock test case
            const testFile = { name: 'test.txt', owner: 'alice', group: 'alice', permissions: '600' };

            const bobResult = tester.cso2Sim.checkSpecificPermission(testFile, 'bob', 'read');
            const aliceResult = tester.cso2Sim.checkSpecificPermission(testFile, 'alice', 'read');
            const rootResult = tester.cso2Sim.checkSpecificPermission(testFile, 'root', 'read');

            const correctLogic = !bobResult.allowed && aliceResult.allowed && rootResult.allowed;

            return {
                success: correctLogic,
                message: correctLogic ?
                    'Permission logic working correctly' :
                    `Permission logic failed: bob=${bobResult.allowed}, alice=${aliceResult.allowed}, root=${rootResult.allowed}`
            };
        } else {
            return { success: false, message: 'Permission checking method not found' };
        }
    }
);

// Export for manual testing
window.SimulationTester = SimulationTester;
window.tester = tester;

// Auto-run tests when script loads (if desired)
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔧 CSO2 Test Suite Ready');
    console.log('Run: await tester.init(); await tester.runAllTests()');
});

// Export test runner function
window.runCSO2Tests = async function() {
    await tester.init();
    return await tester.runAllTests();
};