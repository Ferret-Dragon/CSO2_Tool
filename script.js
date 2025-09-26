// CSO2 Interactive Simulations - Main JavaScript File
class CSO2Simulations {
    constructor() {
        this.currentSimulation = 'build-system';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.initBuildSystemVisualizer();
        this.initPermissionsSandbox();
        this.initSignalPlayground();
        this.initProcessTreeExplorer();
        this.initVirtualMemoryMapper();
        this.initCacheExplorer();
        this.initThreadRaceLab();
        this.initNetworkLayersGame();
        this.initPipelineBuilder();
        this.initSideChannelDemo();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const simulations = document.querySelectorAll('.simulation');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetSim = btn.dataset.sim;

                // Update active navigation button
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show target simulation
                simulations.forEach(sim => {
                    sim.classList.remove('active');
                    if (sim.id === targetSim) {
                        sim.classList.add('active', 'fade-in');
                    }
                });

                this.currentSimulation = targetSim;
            });
        });
    }

    // Build System Visualizer
    initBuildSystemVisualizer() {
        const projectBox = document.getElementById('project-box');
        const fileItems = document.querySelectorAll('.file-item');
        const buildBtn = document.getElementById('build-btn');
        const cleanBtn = document.getElementById('clean-btn');
        const buildStages = document.getElementById('build-stages');
        const modifyUtilBtn = document.getElementById('modify-util-btn');

        this.projectFiles = [];
        this.utilModified = false;
        this.lastBuildTime = null;

        // Drag and drop functionality
        fileItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: item.dataset.type,
                    name: item.dataset.name,
                    depends: item.dataset.depends
                }));
            });
        });

        projectBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            projectBox.classList.add('dragover');
        });

        projectBox.addEventListener('dragleave', () => {
            projectBox.classList.remove('dragover');
        });

        projectBox.addEventListener('drop', (e) => {
            e.preventDefault();
            projectBox.classList.remove('dragover');

            const fileData = JSON.parse(e.dataTransfer.getData('text/plain'));

            if (!this.projectFiles.some(f => f.name === fileData.name)) {
                this.projectFiles.push(fileData);
                this.updateProjectBox(projectBox, this.projectFiles);
            }
        });

        buildBtn.addEventListener('click', () => {
            if (this.projectFiles.length > 0) {
                this.animateSpecificBuildProcess(buildStages, this.projectFiles);
            } else {
                alert('Please add some files to the project box first!');
            }
        });

        cleanBtn.addEventListener('click', () => {
            this.projectFiles = [];
            this.utilModified = false;
            this.lastBuildTime = null;
            this.updateProjectBox(projectBox, this.projectFiles);
            buildStages.innerHTML = '';
        });

        modifyUtilBtn.addEventListener('click', () => {
            if (this.projectFiles.some(f => f.name === 'util.c')) {
                this.utilModified = true;
                alert('util.c has been modified! Try rebuilding to see incremental compilation.');
                modifyUtilBtn.textContent = 'util.c (modified)';
                modifyUtilBtn.style.background = '#e74c3c';
            } else {
                alert('Please add util.c to your project first!');
            }
        });
    }

    updateProjectBox(projectBox, files) {
        if (files.length === 0) {
            projectBox.innerHTML = '<p>Drag source files, headers, and libraries here</p>';
        } else {
            projectBox.innerHTML = files.map(file =>
                `<div class="file-item" data-type="${file.type}">${file.name}</div>`
            ).join('');
        }
    }

    animateSpecificBuildProcess(buildStages, files) {
        buildStages.innerHTML = '<h4>Build Process:</h4>';

        // Check if this is a rebuild and if util.c was modified
        const isRebuild = this.lastBuildTime !== null;
        const needsIncremental = isRebuild && this.utilModified;

        if (needsIncremental) {
            buildStages.innerHTML += '<p style="color: #e67e22;">Incremental build detected - only recompiling modified files...</p>';
        }

        const compileFiles = files.filter(f => f.type === 'source');
        const processStep = (stepIndex) => {
            if (stepIndex < compileFiles.length) {
                const file = compileFiles[stepIndex];
                const outputFile = file.name.replace('.c', '.o');

                // Skip compilation if not modified during incremental build
                if (needsIncremental && file.name !== 'util.c') {
                    buildStages.innerHTML += `<div class="build-step skipped">${file.name} → ${outputFile} (skipped - not modified)</div>`;
                    setTimeout(() => processStep(stepIndex + 1), 500);
                    return;
                }

                const stepDiv = document.createElement('div');
                stepDiv.className = 'build-step active';
                stepDiv.innerHTML = `${file.name} → ${outputFile}`;
                buildStages.appendChild(stepDiv);

                setTimeout(() => {
                    stepDiv.classList.remove('active');
                    stepDiv.classList.add('complete');
                    stepDiv.innerHTML = `✓ ${file.name} → ${outputFile}`;
                    processStep(stepIndex + 1);
                }, 1500);

            } else {
                // Linking step
                const linkStep = document.createElement('div');
                linkStep.className = 'build-step active';
                linkStep.innerHTML = 'Linking: main.o, util.o, math.o → program.exe';
                buildStages.appendChild(linkStep);

                setTimeout(() => {
                    linkStep.classList.remove('active');
                    linkStep.classList.add('complete');
                    linkStep.innerHTML = '✓ Linking: main.o, util.o, math.o → program.exe';

                    const successDiv = document.createElement('div');
                    successDiv.className = 'build-stage complete';
                    successDiv.innerHTML = '🎉 Build successful! Executable created: program.exe';
                    buildStages.appendChild(successDiv);

                    // Reset modification flag
                    this.utilModified = false;
                    this.lastBuildTime = Date.now();

                    const modifyBtn = document.getElementById('modify-util-btn');
                    modifyBtn.textContent = 'Modify util.c';
                    modifyBtn.style.background = '';

                }, 2000);
            }
        };

        processStep(0);
    }

    // Permissions Sandbox
    initPermissionsSandbox() {
        const filesystem = document.getElementById('filesystem');
        const currentUserSelect = document.getElementById('current-user');
        const filePermissionsSelect = document.getElementById('file-permissions');
        const actionBtns = document.querySelectorAll('.action-btn');
        const resultDisplay = document.getElementById('permission-result');

        // Sample filesystem matching the example
        this.fileSystem = [
            { name: 'secret.txt', owner: 'alice', group: 'alice', permissions: '600', selected: true },
            { name: 'public.txt', owner: 'alice', group: 'alice', permissions: '644', selected: false },
            { name: 'script.sh', owner: 'bob', group: 'users', permissions: '755', selected: false }
        ];

        this.selectedFile = this.fileSystem[0]; // secret.txt is selected by default
        this.currentUser = 'bob';

        this.renderSpecificFileSystem(filesystem);

        currentUserSelect.addEventListener('change', () => {
            this.currentUser = currentUserSelect.value;
            this.renderSpecificFileSystem(filesystem);
        });

        filePermissionsSelect.addEventListener('change', () => {
            if (this.selectedFile) {
                this.selectedFile.permissions = filePermissionsSelect.value;
                this.renderSpecificFileSystem(filesystem);
                resultDisplay.innerHTML = `<span style="color: #3498db;">File permissions changed to ${filePermissionsSelect.value}</span>`;
            }
        });

        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.selectedFile) {
                    this.showSpecificPermissionResult(resultDisplay, 'Please select a file first!', 'error');
                    return;
                }

                const action = btn.dataset.action;
                const result = this.checkSpecificPermission(this.selectedFile, this.currentUser, action);
                this.showSpecificPermissionResult(resultDisplay, result.message, result.allowed ? 'success' : 'error');
            });
        });
    }

    renderFileSystem(container) {
        container.innerHTML = this.fileSystem.map((file, index) =>
            `<div class="file-entry" data-index="${index}">
                <span>${file.name}</span>
                <span style="float: right">${file.permissions} ${file.owner}:${file.group}</span>
            </div>`
        ).join('');

        container.querySelectorAll('.file-entry').forEach(entry => {
            entry.addEventListener('click', () => {
                container.querySelectorAll('.file-entry').forEach(e => e.classList.remove('selected'));
                entry.classList.add('selected');
                this.selectedFile = this.fileSystem[parseInt(entry.dataset.index)];
            });
        });
    }

    checkPermission(file, userId, groupId, action) {
        const perms = file.permissions;
        const ownerPerms = parseInt(perms[0]);
        const groupPerms = parseInt(perms[1]);
        const otherPerms = parseInt(perms[2]);

        let permissionBits;
        if (userId === file.owner) {
            permissionBits = ownerPerms;
        } else if (groupId === file.group) {
            permissionBits = groupPerms;
        } else {
            permissionBits = otherPerms;
        }

        let requiredBit;
        switch (action) {
            case 'read': requiredBit = 4; break;
            case 'write': requiredBit = 2; break;
            case 'execute': requiredBit = 1; break;
        }

        const allowed = (permissionBits & requiredBit) !== 0;

        return {
            allowed: allowed,
            message: `${action.toUpperCase()} access to ${file.name}: ${allowed ? 'GRANTED' : 'DENIED'} (${perms})`
        };
    }

    renderSpecificFileSystem(container) {
        container.innerHTML = this.fileSystem.map((file, index) =>
            `<div class="file-entry ${file.selected ? 'selected' : ''}" data-index="${index}">
                <span>${file.name}</span>
                <span style="float: right">${file.permissions} ${file.owner}:${file.group}</span>
            </div>`
        ).join('');

        container.querySelectorAll('.file-entry').forEach(entry => {
            entry.addEventListener('click', () => {
                // Update selected file
                this.fileSystem.forEach(f => f.selected = false);
                const index = parseInt(entry.dataset.index);
                this.fileSystem[index].selected = true;
                this.selectedFile = this.fileSystem[index];

                // Update permissions dropdown
                document.getElementById('file-permissions').value = this.selectedFile.permissions;

                // Re-render filesystem
                this.renderSpecificFileSystem(container);
            });
        });
    }

    checkSpecificPermission(file, user, action) {
        // Handle root user (superuser)
        if (user === 'root') {
            return {
                allowed: true,
                message: `✓ ${action.toUpperCase()}: Permission GRANTED (root has superuser privileges)`
            };
        }

        const perms = file.permissions;
        const ownerPerms = parseInt(perms[0]);
        const groupPerms = parseInt(perms[1]);
        const otherPerms = parseInt(perms[2]);

        let permissionBits;
        let userType;

        if (user === file.owner) {
            permissionBits = ownerPerms;
            userType = 'owner';
        } else if (user === file.group) {
            permissionBits = groupPerms;
            userType = 'group member';
        } else {
            permissionBits = otherPerms;
            userType = 'other user';
        }

        let requiredBit;
        switch (action) {
            case 'read': requiredBit = 4; break;
            case 'write': requiredBit = 2; break;
            case 'execute': requiredBit = 1; break;
        }

        const allowed = (permissionBits & requiredBit) !== 0;

        return {
            allowed: allowed,
            message: allowed
                ? `✓ ${action.toUpperCase()}: Permission GRANTED (${user} as ${userType} has ${action} access to ${file.name})`
                : `✗ ${action.toUpperCase()}: Permission DENIED (${user} as ${userType} lacks ${action} access to ${file.name} with permissions ${perms})`
        };
    }

    showSpecificPermissionResult(container, message, type) {
        container.innerHTML = message;
        container.className = `result-display ${type}`;
    }

    showPermissionResult(container, message, type) {
        container.textContent = message;
        container.className = `result-display ${type}`;
    }

    // Signal Playground
    initSignalPlayground() {
        const processState = document.getElementById('process-state');
        const processOutput = document.getElementById('process-output');
        const signalBtns = document.querySelectorAll('.signal-btn');
        const restartBtn = document.getElementById('restart-process');
        const timeline = document.getElementById('signal-timeline');
        const handlerRadios = document.querySelectorAll('input[name="sigint-action"]');
        const customHandlerCode = document.getElementById('custom-handler-code');

        this.processRunning = true;
        this.countValue = 1;
        this.countInterval = null;
        this.timelineEvents = [];

        // Show/hide custom handler code
        handlerRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                customHandlerCode.style.display = radio.value === 'custom' ? 'block' : 'none';
            });
        });

        // Start counting process
        this.startCountProcess(processState, processOutput);

        // Restart process
        restartBtn.addEventListener('click', () => {
            this.restartCountProcess(processState, processOutput, timeline);
        });

        // Signal handling
        signalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const signal = btn.dataset.signal;
                const handlerType = document.querySelector('input[name="sigint-action"]:checked').value;
                this.handleSpecificSignal(signal, handlerType, processState, processOutput, timeline);
            });
        });
    }

    startCountProcess(processState, processOutput) {
        this.processRunning = true;
        this.countValue = 1;
        processOutput.innerHTML = '';

        this.countInterval = setInterval(() => {
            if (this.processRunning) {
                processOutput.innerHTML += `count: ${this.countValue}<br>`;
                processState.textContent = `count: ${this.countValue}`;
                this.countValue++;

                // Scroll to bottom
                processOutput.scrollTop = processOutput.scrollHeight;

                // Limit output to prevent overflow
                if (this.countValue > 100) {
                    const lines = processOutput.innerHTML.split('<br>');
                    processOutput.innerHTML = lines.slice(-50).join('<br>');
                }
            }
        }, 800);
    }

    restartCountProcess(processState, processOutput, timeline) {
        if (this.countInterval) {
            clearInterval(this.countInterval);
        }

        processState.className = 'process-state running';
        timeline.innerHTML = '';
        this.timelineEvents = [];
        this.startCountProcess(processState, processOutput);
    }

    handleSpecificSignal(signal, handlerType, processState, processOutput, timeline) {
        const timestamp = Date.now();

        // Add signal event to timeline
        this.timelineEvents.push({
            type: 'signal',
            signal: signal,
            timestamp: timestamp,
            handlerType: handlerType
        });

        if (signal === 'SIGINT') {
            switch (handlerType) {
                case 'default':
                    // Process terminates immediately
                    this.processRunning = false;
                    if (this.countInterval) {
                        clearInterval(this.countInterval);
                    }
                    processState.textContent = 'Process terminated';
                    processState.className = 'process-state terminated';
                    processOutput.innerHTML += `<span style="color: #e74c3c;">Process terminated by SIGINT</span><br>`;
                    break;

                case 'custom':
                    // Custom handler runs, process continues
                    processOutput.innerHTML += `<span style="color: #f39c12;">Caught SIGINT!</span><br>`;
                    this.timelineEvents.push({
                        type: 'handler',
                        signal: signal,
                        timestamp: Date.now(),
                        message: 'Custom handler executed'
                    });
                    break;

                case 'ignore':
                    // Signal ignored, no effect
                    processOutput.innerHTML += `<span style="color: #95a5a6;">SIGINT ignored (SIG_IGN)</span><br>`;
                    this.timelineEvents.push({
                        type: 'ignored',
                        signal: signal,
                        timestamp: Date.now(),
                        message: 'Signal ignored'
                    });
                    break;
            }
        }

        this.updateSpecificSignalTimeline(timeline, this.timelineEvents);
    }

    updateSpecificSignalTimeline(timeline, events) {
        const startTime = events.length > 0 ? events[0].timestamp : Date.now();

        timeline.innerHTML = '<h4>Signal Timeline:</h4>' + events.map((event, index) => {
            const relativeTime = event.timestamp - startTime;
            const timeStr = `T+${(relativeTime / 1000).toFixed(1)}s`;

            let eventDesc = '';
            switch (event.type) {
                case 'signal':
                    eventDesc = `📡 ${event.signal} received (${event.handlerType})`;
                    break;
                case 'handler':
                    eventDesc = `⚡ ${event.message}`;
                    break;
                case 'ignored':
                    eventDesc = `🚫 ${event.message}`;
                    break;
            }

            return `<div class="timeline-entry ${event.type}" style="margin-left: ${index * 20}px">
                ${timeStr}: ${eventDesc}
            </div>`;
        }).join('');
    }

    updateSignalTimeline(timeline, events) {
        const startTime = events.length > 0 ? events[0].timestamp : Date.now();
        const timelineWidth = timeline.offsetWidth - 40;

        timeline.innerHTML = events.map(event => {
            const relativeTime = event.timestamp - startTime;
            const position = Math.min((relativeTime / 5000) * timelineWidth, timelineWidth - 100);

            return `<div class="timeline-event ${event.type}" style="left: ${position}px; top: ${events.indexOf(event) * 30}px">
                ${event.type === 'signal' ? `Signal: ${event.signal}` : `Handler: ${event.signal}`}
            </div>`;
        }).join('');
    }

    // Process Tree Explorer
    initProcessTreeExplorer() {
        const forkBtn = document.getElementById('fork-btn');
        const execBtn = document.getElementById('exec-btn');
        const terminateBtn = document.getElementById('terminate-btn');
        const killParentBtn = document.getElementById('kill-parent-btn');
        const viewModeSelect = document.getElementById('process-view-mode');
        const autoDemoBtn = document.getElementById('auto-demo-btn');

        // Initialize process data with file descriptors and inheritance info
        this.processes = [
            {
                pid: 1,
                ppid: 0,
                name: 'init',
                status: 'running',
                fds: [0, 1, 2], // stdin, stdout, stderr
                environment: { PATH: '/bin:/usr/bin', USER: 'root' },
                cwd: '/',
                children: []
            }
        ];
        this.selectedProcess = null;
        this.nextPid = 2;
        this.viewMode = 'basic';
        this.orphanedProcesses = [];
        this.zombieProcesses = [];

        // Setup initial processes
        this.setupInitialProcesses();
        this.renderProcessTree();

        // Event listeners
        forkBtn.addEventListener('click', () => this.forkProcess());
        execBtn.addEventListener('click', () => this.execProcess());
        terminateBtn.addEventListener('click', () => this.terminateProcess());
        killParentBtn.addEventListener('click', () => this.killParentProcess());
        viewModeSelect.addEventListener('change', (e) => {
            this.viewMode = e.target.value;
            this.renderProcessTree();
        });
        autoDemoBtn.addEventListener('click', () => this.runAutoDemo());
    }

    setupInitialProcesses() {
        // Create a shell process
        const shell = {
            pid: this.nextPid++,
            ppid: 1,
            name: 'bash',
            status: 'running',
            fds: [0, 1, 2, 3], // inherited + pipe
            environment: { PATH: '/bin:/usr/bin', USER: 'student', HOME: '/home/student' },
            cwd: '/home/student',
            children: []
        };
        this.processes.push(shell);

        // Create some child processes
        const editor = {
            pid: this.nextPid++,
            ppid: shell.pid,
            name: 'vim',
            status: 'running',
            fds: [0, 1, 2, 4], // inherited + file descriptor for editing
            environment: { ...shell.environment, EDITOR: 'vim' },
            cwd: shell.cwd,
            children: []
        };
        this.processes.push(editor);

        const compiler = {
            pid: this.nextPid++,
            ppid: shell.pid,
            name: 'gcc',
            status: 'running',
            fds: [0, 1, 2, 5, 6], // inherited + input/output files
            environment: shell.environment,
            cwd: shell.cwd,
            children: []
        };
        this.processes.push(compiler);
    }

    renderProcessTree() {
        const container = document.getElementById('process-tree');
        const buildTree = (parentPid, level = 0) => {
            return this.processes
                .filter(p => p.ppid === parentPid)
                .map(process => {
                    const nodeContent = this.getProcessDisplayContent(process, level);
                    const children = buildTree(process.pid, level + 1);
                    const maxIndent = Math.min(level * 20, 200); // Limit max indentation

                    return `<div class="process-node-wrapper" style="margin-left: ${maxIndent}px">
                        <div class="process-node ${process.status}" data-pid="${process.pid}">
                            <span class="process-text">${nodeContent}</span>
                            ${process.pid !== 1 ? '<button class="terminate-btn" title="Terminate process">❌</button>' : ''}
                        </div>
                        ${children}
                    </div>`;
                }).join('');
        };

        container.innerHTML = buildTree(0);

        // Add click handlers to all process nodes
        container.querySelectorAll('.process-node').forEach(node => {
            const pid = parseInt(node.dataset.pid);
            const process = this.processes.find(p => p.pid === pid);

            // Make entire node clickable
            node.addEventListener('click', (e) => {
                if (e.target.classList.contains('terminate-btn')) return; // Don't select when clicking terminate button

                container.querySelectorAll('.process-node').forEach(n => n.classList.remove('selected'));
                node.classList.add('selected');
                this.selectedProcess = process;
                this.updateProcessDetails();
            });
        });

        // Add terminate button handlers
        container.querySelectorAll('.terminate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const node = e.target.closest('.process-node');
                const pid = parseInt(node.dataset.pid);
                const process = this.processes.find(p => p.pid === pid);
                this.terminateSpecificProcess(process);
            });
        });

        this.updateSystemStatus();
    }

    getProcessDisplayContent(process, level) {
        const indent = '  '.repeat(level);

        switch (this.viewMode) {
            case 'basic':
                return `${indent}├─ [${process.pid}] ${process.name} (${process.status})`;

            case 'pids':
                return `${indent}├─ PID:${process.pid} PPID:${process.ppid} ${process.name} (${process.status})`;

            case 'fds':
                const fdList = process.fds.join(',');
                return `${indent}├─ [${process.pid}] ${process.name} FDs:[${fdList}] (${process.status})`;

            case 'inheritance':
                const inheritedFrom = process.ppid !== 0 ? this.processes.find(p => p.pid === process.ppid) : null;
                const inherited = inheritedFrom ? `↳ inherited: ${inheritedFrom.fds.length} FDs, env` : '';
                return `${indent}├─ [${process.pid}] ${process.name} ${inherited} (${process.status})`;

            default:
                return `${indent}├─ [${process.pid}] ${process.name} (${process.status})`;
        }
    }

    forkProcess() {
        if (!this.selectedProcess) {
            alert('Please select a parent process first!');
            return;
        }

        const parent = this.selectedProcess;
        const childProcess = {
            pid: this.nextPid++,
            ppid: parent.pid,
            name: `child_${parent.name}`,
            status: 'running',
            fds: [...parent.fds], // Inherit file descriptors
            environment: { ...parent.environment }, // Copy environment
            cwd: parent.cwd, // Inherit working directory
            children: []
        };

        this.processes.push(childProcess);
        this.animateProcessCreation(childProcess);
        this.renderProcessTree();
    }

    execProcess() {
        if (!this.selectedProcess || this.selectedProcess.pid === 1) {
            alert('Please select a non-init process first!');
            return;
        }

        const programs = [
            { name: 'python', fds: [0, 1, 2, 7] },
            { name: 'node', fds: [0, 1, 2, 8, 9] },
            { name: 'java', fds: [0, 1, 2, 10, 11, 12] },
            { name: 'firefox', fds: [0, 1, 2, 13, 14, 15, 16] }
        ];

        const newProgram = programs[Math.floor(Math.random() * programs.length)];

        // exec replaces process image but keeps PID and inheritance
        this.selectedProcess.name = newProgram.name;
        this.selectedProcess.fds = newProgram.fds;

        this.animateProcessExec(this.selectedProcess);
        this.renderProcessTree();
    }

    terminateProcess() {
        if (!this.selectedProcess || this.selectedProcess.pid === 1) {
            alert('Cannot terminate init process!');
            return;
        }
        this.terminateSpecificProcess(this.selectedProcess);
    }

    terminateSpecificProcess(process) {
        if (process.pid === 1) return;

        // Find children of this process
        const children = this.processes.filter(p => p.ppid === process.pid);

        // Create zombie state first
        process.status = 'zombie';
        this.zombieProcesses.push(process.pid);

        // If process has children, they become orphans (adopted by init)
        if (children.length > 0) {
            children.forEach(child => {
                child.ppid = 1; // Adopted by init
                this.orphanedProcesses.push(child.pid);
                this.animateOrphanAdoption(child);
            });
        }

        // Simulate parent reaping after a delay
        setTimeout(() => {
            this.reapZombie(process.pid);
        }, 2000);

        this.renderProcessTree();
    }

    killParentProcess() {
        if (!this.selectedProcess || this.selectedProcess.pid === 1) {
            alert('Please select a non-init process first!');
            return;
        }

        const parent = this.processes.find(p => p.pid === this.selectedProcess.ppid);
        if (parent && parent.pid !== 1) {
            this.terminateSpecificProcess(parent);
        } else {
            alert('Selected process has no killable parent!');
        }
    }

    reapZombie(pid) {
        this.processes = this.processes.filter(p => p.pid !== pid);
        this.zombieProcesses = this.zombieProcesses.filter(z => z !== pid);

        if (this.selectedProcess && this.selectedProcess.pid === pid) {
            this.selectedProcess = null;
        }

        this.renderProcessTree();
        this.updateProcessDetails();
    }

    animateProcessCreation(process) {
        const message = `🍴 fork() created PID ${process.pid} from parent PID ${process.ppid}`;
        this.showProcessMessage(message, 'info');
    }

    animateProcessExec(process) {
        const message = `🔄 exec() replaced process PID ${process.pid} with ${process.name}`;
        this.showProcessMessage(message, 'info');
    }

    animateOrphanAdoption(process) {
        const message = `👤 Orphan PID ${process.pid} adopted by init (PID 1)`;
        this.showProcessMessage(message, 'warning');
    }

    showProcessMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `process-message ${type}`;
        messageDiv.textContent = message;

        const container = document.getElementById('process-tree');
        container.parentNode.insertBefore(messageDiv, container);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    updateSystemStatus() {
        const orphanStatus = document.getElementById('orphan-status');
        const zombieStatus = document.getElementById('zombie-status');

        orphanStatus.innerHTML = this.orphanedProcesses.length > 0
            ? `⚠️ Orphaned: ${this.orphanedProcesses.length} processes`
            : '✅ No orphaned processes';

        zombieStatus.innerHTML = this.zombieProcesses.length > 0
            ? `🧟 Zombies: ${this.zombieProcesses.length} processes`
            : '✅ No zombie processes';
    }

    updateProcessDetails() {
        const detailsPanel = document.getElementById('process-details');
        if (this.selectedProcess) {
            const process = this.selectedProcess;
            const parent = this.processes.find(p => p.pid === process.ppid);
            const children = this.processes.filter(p => p.ppid === process.pid);

            detailsPanel.innerHTML = `
                <h4>Process Details</h4>
                <div class="process-info">
                    <p><strong>PID:</strong> ${process.pid}</p>
                    <p><strong>PPID:</strong> ${process.ppid} ${parent ? `(${parent.name})` : ''}</p>
                    <p><strong>Name:</strong> ${process.name}</p>
                    <p><strong>Status:</strong> <span class="status ${process.status}">${process.status}</span></p>
                    <p><strong>Working Directory:</strong> ${process.cwd}</p>
                    <p><strong>File Descriptors:</strong> [${process.fds.join(', ')}]</p>
                    <p><strong>Children:</strong> ${children.length} process(es)</p>

                    <h5>Environment Variables:</h5>
                    <div class="env-vars">
                        ${Object.entries(process.environment).map(([key, value]) =>
                            `<div>${key}=${value}</div>`
                        ).join('')}
                    </div>

                    ${children.length > 0 ? `
                        <h5>Child Processes:</h5>
                        <div class="child-list">
                            ${children.map(child =>
                                `<div>PID ${child.pid}: ${child.name} (${child.status})</div>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            detailsPanel.innerHTML = '<p>No process selected. Click on a process to see details.</p>';
        }
    }

    async runAutoDemo() {
        const demoBtn = document.getElementById('auto-demo-btn');
        demoBtn.disabled = true;
        demoBtn.textContent = 'Running Demo...';

        try {
            // Select shell process
            this.selectedProcess = this.processes.find(p => p.name === 'bash');
            this.renderProcessTree();

            await this.wait(1000);
            this.showProcessMessage('Demo: Forking a new process...', 'info');
            this.forkProcess();

            await this.wait(2000);
            this.showProcessMessage('Demo: Killing parent to create orphan...', 'warning');
            this.killParentProcess();

            await this.wait(3000);
            this.showProcessMessage('Demo: Switching to File Descriptor view...', 'info');
            document.getElementById('process-view-mode').value = 'fds';
            this.viewMode = 'fds';
            this.renderProcessTree();

            await this.wait(2000);
            this.showProcessMessage('Demo: Switching to Inheritance view...', 'info');
            document.getElementById('process-view-mode').value = 'inheritance';
            this.viewMode = 'inheritance';
            this.renderProcessTree();

        } finally {
            demoBtn.disabled = false;
            demoBtn.textContent = 'Auto Demo';
        }
    }

    // Virtual Memory Mapper
    initVirtualMemoryMapper() {
        const virtualAddrInput = document.getElementById('virtual-addr');
        const translateBtn = document.getElementById('translate-btn');
        const pageTable = document.getElementById('page-table');
        const physicalMemory = document.getElementById('physical-memory');
        const pageFaultBtn = document.getElementById('page-fault-btn');
        const cowBtn = document.getElementById('cow-btn');

        // Initialize page table and physical memory
        this.pageTableEntries = {};
        this.physicalFrames = new Array(16).fill(null).map((_, i) => ({ used: false, page: null }));

        this.renderPageTable(pageTable);
        this.renderPhysicalMemory(physicalMemory);

        translateBtn.addEventListener('click', () => {
            const virtualAddr = virtualAddrInput.value;
            if (virtualAddr.match(/^0x[0-9a-fA-F]+$/)) {
                this.translateAddress(virtualAddr, pageTable, physicalMemory);
            } else {
                alert('Please enter a valid hex address (e.g., 0x1000)');
            }
        });

        pageFaultBtn.addEventListener('click', () => this.triggerPageFault());
        cowBtn.addEventListener('click', () => this.demonstrateCopyOnWrite());
    }

    translateAddress(virtualAddr, pageTableContainer, physicalMemoryContainer) {
        const addr = parseInt(virtualAddr, 16);
        const pageNumber = Math.floor(addr / 4096); // 4KB pages
        const offset = addr % 4096;

        let frameNumber;
        if (this.pageTableEntries[pageNumber]) {
            frameNumber = this.pageTableEntries[pageNumber].frame;
        } else {
            // Page fault - allocate new frame
            frameNumber = this.allocateFrame(pageNumber);
            this.pageTableEntries[pageNumber] = { frame: frameNumber, present: true };
        }

        const physicalAddr = frameNumber * 4096 + offset;

        this.renderPageTable(pageTableContainer, pageNumber);
        this.renderPhysicalMemory(physicalMemoryContainer, frameNumber);

        alert(`Virtual Address: ${virtualAddr}\nPage: ${pageNumber}, Offset: ${offset}\nPhysical Address: 0x${physicalAddr.toString(16)}\nFrame: ${frameNumber}`);
    }

    allocateFrame(pageNumber) {
        for (let i = 0; i < this.physicalFrames.length; i++) {
            if (!this.physicalFrames[i].used) {
                this.physicalFrames[i] = { used: true, page: pageNumber };
                return i;
            }
        }

        // If no free frames, evict one (simple FIFO)
        const victimFrame = Math.floor(Math.random() * this.physicalFrames.length);
        this.physicalFrames[victimFrame] = { used: true, page: pageNumber };
        return victimFrame;
    }

    renderPageTable(container, highlightPage = null) {
        container.innerHTML = `
            <div style="font-weight: bold; border-bottom: 1px solid #34495e; padding: 5px;">
                Page | Frame | Present
            </div>
            ${Object.entries(this.pageTableEntries).map(([page, entry]) =>
                `<div class="page-entry ${page == highlightPage ? 'highlight' : ''}">
                    <span>${page}</span>
                    <span>${entry.frame}</span>
                    <span>${entry.present ? 'Yes' : 'No'}</span>
                </div>`
            ).join('')}
        `;
    }

    renderPhysicalMemory(container, highlightFrame = null) {
        container.innerHTML = this.physicalFrames.map((frame, index) =>
            `<div class="memory-block ${frame.used ? 'used' : 'free'} ${index === highlightFrame ? 'accessed' : ''}"
                 title="Frame ${index}: ${frame.used ? `Page ${frame.page}` : 'Free'}">
                ${index}
            </div>`
        ).join('');
    }

    triggerPageFault() {
        alert('Page fault triggered! Simulating demand loading...');
        setTimeout(() => {
            alert('Page loaded from disk into physical memory.');
        }, 1000);
    }

    demonstrateCopyOnWrite() {
        alert('Copy-on-Write demonstrated: Page marked as read-only, will be copied when written to.');
    }

    // Cache Hit/Miss Explorer
    initCacheExplorer() {
        const cacheSizeSelect = document.getElementById('cache-size');
        const associativitySelect = document.getElementById('associativity');
        const memoryPatternTextarea = document.getElementById('memory-pattern');
        const runCacheBtn = document.getElementById('run-cache');
        const cacheDisplay = document.getElementById('cache-display');
        const cacheStats = document.getElementById('cache-stats');

        this.cache = null;
        this.cacheHits = 0;
        this.cacheMisses = 0;

        runCacheBtn.addEventListener('click', () => {
            this.runCacheSimulation(cacheSizeSelect, associativitySelect, memoryPatternTextarea, cacheDisplay, cacheStats);
        });
    }

    runCacheSimulation(sizeSelect, assocSelect, patternTextarea, displayContainer, statsContainer) {
        const cacheSize = parseInt(sizeSelect.value);
        const associativity = parseInt(assocSelect.value);
        const addresses = patternTextarea.value.trim().split('\n').filter(addr => addr.trim());

        // Initialize cache
        this.cache = new Array(cacheSize).fill(null).map(() => ({
            valid: false,
            tag: null,
            data: null
        }));

        this.cacheHits = 0;
        this.cacheMisses = 0;

        // Process each address
        addresses.forEach((addr, index) => {
            setTimeout(() => {
                this.processMemoryAccess(addr.trim(), cacheSize, associativity);
                this.renderCacheDisplay(displayContainer);
                this.updateCacheStats(statsContainer);
            }, index * 500);
        });
    }

    processMemoryAccess(address, cacheSize, associativity) {
        const addr = parseInt(address, 16);
        const blockSize = 64; // 64 bytes per block
        const blockAddr = Math.floor(addr / blockSize);
        const setIndex = blockAddr % (cacheSize / associativity);
        const tag = Math.floor(blockAddr / (cacheSize / associativity));

        // Check for hit in the set
        let hit = false;
        const setStart = setIndex * associativity;
        const setEnd = setStart + associativity;

        for (let i = setStart; i < setEnd; i++) {
            if (this.cache[i].valid && this.cache[i].tag === tag) {
                hit = true;
                this.cache[i].status = 'hit';
                this.cacheHits++;
                break;
            }
        }

        if (!hit) {
            // Cache miss - find empty or evict
            let targetIndex = -1;
            for (let i = setStart; i < setEnd; i++) {
                if (!this.cache[i].valid) {
                    targetIndex = i;
                    break;
                }
            }

            if (targetIndex === -1) {
                // All lines in set are valid, evict randomly
                targetIndex = setStart + Math.floor(Math.random() * associativity);
            }

            this.cache[targetIndex] = {
                valid: true,
                tag: tag,
                data: address,
                status: 'miss'
            };

            this.cacheMisses++;
        }
    }

    renderCacheDisplay(container) {
        container.innerHTML = this.cache.map((line, index) =>
            `<div class="cache-line ${line.valid ? line.status || 'valid' : 'empty'}">
                Line ${index}<br>
                ${line.valid ? `Tag: ${line.tag}<br>Data: ${line.data}` : 'Empty'}
            </div>`
        ).join('');

        // Reset status indicators after animation
        setTimeout(() => {
            this.cache.forEach(line => {
                if (line.status) delete line.status;
            });
        }, 1000);
    }

    updateCacheStats(container) {
        const totalAccesses = this.cacheHits + this.cacheMisses;
        const hitRate = totalAccesses > 0 ? ((this.cacheHits / totalAccesses) * 100).toFixed(1) : 0;

        container.innerHTML = `
            <div class="stat">
                <div class="stat-value">${this.cacheHits}</div>
                <div>Hits</div>
            </div>
            <div class="stat">
                <div class="stat-value">${this.cacheMisses}</div>
                <div>Misses</div>
            </div>
            <div class="stat">
                <div class="stat-value">${hitRate}%</div>
                <div>Hit Rate</div>
            </div>
        `;
    }

    // Thread Race Lab
    initThreadRaceLab() {
        const threadCountInput = document.getElementById('thread-count');
        const iterationsInput = document.getElementById('iterations');
        const useMutexCheckbox = document.getElementById('use-mutex');
        const useBarrierCheckbox = document.getElementById('use-barrier');
        const useSemaphoreCheckbox = document.getElementById('use-semaphore');
        const startThreadsBtn = document.getElementById('start-threads');
        const sharedCounter = document.getElementById('shared-counter');
        const threadTimeline = document.getElementById('thread-timeline');

        this.sharedCounterValue = 0;

        startThreadsBtn.addEventListener('click', () => {
            this.runThreadSimulation(
                parseInt(threadCountInput.value),
                parseInt(iterationsInput.value),
                useMutexCheckbox.checked,
                useBarrierCheckbox.checked,
                useSemaphoreCheckbox.checked,
                sharedCounter,
                threadTimeline
            );
        });
    }

    runThreadSimulation(threadCount, iterations, useMutex, useBarrier, useSemaphore, counterDisplay, timeline) {
        this.sharedCounterValue = 0;
        counterDisplay.textContent = `Shared Counter: ${this.sharedCounterValue}`;

        // Clear timeline
        timeline.innerHTML = '';

        const threads = [];
        for (let i = 0; i < threadCount; i++) {
            const threadBar = document.createElement('div');
            threadBar.className = `thread-bar thread-${i + 1}`;
            threadBar.textContent = `Thread ${i + 1}`;
            timeline.appendChild(threadBar);
            threads.push(threadBar);
        }

        // Simulate thread execution
        const threadPromises = [];

        for (let threadId = 0; threadId < threadCount; threadId++) {
            const promise = new Promise((resolve) => {
                let completed = 0;
                const threadBar = threads[threadId];

                const incrementCounter = () => {
                    if (completed < iterations) {
                        // Simulate race condition delay
                        const delay = useMutex ? 10 : Math.random() * 20;

                        setTimeout(() => {
                            if (useMutex) {
                                // Atomic increment with mutex
                                this.sharedCounterValue++;
                            } else {
                                // Race condition simulation
                                const temp = this.sharedCounterValue;
                                setTimeout(() => {
                                    this.sharedCounterValue = temp + 1;
                                    counterDisplay.textContent = `Shared Counter: ${this.sharedCounterValue}`;
                                }, Math.random() * 5);
                            }

                            counterDisplay.textContent = `Shared Counter: ${this.sharedCounterValue}`;
                            completed++;

                            // Update progress bar
                            const progress = (completed / iterations) * 100;
                            threadBar.style.background = `linear-gradient(to right,
                                ${threadBar.className.includes('thread-1') ? '#3498db' :
                                  threadBar.className.includes('thread-2') ? '#e74c3c' :
                                  threadBar.className.includes('thread-3') ? '#27ae60' : '#f39c12'} ${progress}%,
                                transparent ${progress}%)`;

                            incrementCounter();
                        }, delay);
                    } else {
                        resolve();
                    }
                };

                incrementCounter();
            });

            threadPromises.push(promise);
        }

        Promise.all(threadPromises).then(() => {
            const expectedValue = threadCount * iterations;
            const actualValue = this.sharedCounterValue;

            if (useMutex && actualValue === expectedValue) {
                counterDisplay.style.background = 'rgba(39, 174, 96, 0.2)';
                counterDisplay.textContent += ' ✓ (Correct)';
            } else if (!useMutex && actualValue !== expectedValue) {
                counterDisplay.style.background = 'rgba(231, 76, 60, 0.2)';
                counterDisplay.textContent += ` ✗ (Expected: ${expectedValue})`;
            }
        });
    }

    // Network Layers Game
    initNetworkLayersGame() {
        const messageInput = document.getElementById('network-message');
        const sendMessageBtn = document.getElementById('send-message');
        const layers = document.querySelectorAll('.layer');
        const introduceErrorsCheckbox = document.getElementById('introduce-errors');
        const enableEncryptionCheckbox = document.getElementById('enable-encryption');

        sendMessageBtn.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message) {
                this.sendNetworkMessage(message, layers, introduceErrorsCheckbox.checked, enableEncryptionCheckbox.checked);
            } else {
                alert('Please enter a message to send!');
            }
        });
    }

    sendNetworkMessage(message, layers, introduceErrors, enableEncryption) {
        let currentMessage = message;
        let currentLayer = 0;
        let messageCorrupted = false;
        let transmissionFailed = false;

        const layerProcessing = [
            {
                name: 'Application Layer',
                process: (msg) => {
                    if (enableEncryption) {
                        return { message: `ENCRYPTED(${msg})`, error: false };
                    }
                    return { message: `HTTP: ${msg}`, error: false };
                }
            },
            {
                name: 'Transport Layer',
                process: (msg) => {
                    if (introduceErrors && Math.random() < 0.3) {
                        messageCorrupted = true;
                        return { message: `TCP: [CORRUPTED] virus`, error: true, errorType: 'corruption' };
                    }
                    return { message: `TCP: [SEQ:1] ${msg}`, error: false };
                }
            },
            {
                name: 'Network Layer',
                process: (msg) => {
                    const srcIP = '192.168.1.100';
                    const destIP = '192.168.1.200';

                    if (introduceErrors && Math.random() < 0.2) {
                        transmissionFailed = true;
                        return { message: `IP: ${srcIP} -> 3.3.3.3 | ${msg} [NO ROUTE]`, error: true, errorType: 'routing' };
                    }

                    return { message: `IP: ${srcIP} -> ${destIP} | ${msg}`, error: false };
                }
            },
            {
                name: 'Link Layer',
                process: (msg) => {
                    const srcMAC = 'AA:BB:CC:DD:EE:FF';
                    const destMAC = '11:22:33:44:55:66';

                    if (introduceErrors && Math.random() < 0.15) {
                        transmissionFailed = true;
                        return { message: `ETH: ${srcMAC} -> ${destMAC} | ${msg} [COLLISION]`, error: true, errorType: 'collision' };
                    }

                    return { message: `ETH: ${srcMAC} -> ${destMAC} | ${msg}`, error: false };
                }
            }
        ];

        const processLayer = () => {
            if (currentLayer < layers.length && !transmissionFailed) {
                layers[currentLayer].classList.add('active');

                const processor = layerProcessing[currentLayer];
                const result = processor.process(currentMessage);

                currentMessage = result.message;
                layers[currentLayer].querySelector('.layer-content').textContent = currentMessage;

                // Add error styling if there's an error
                if (result.error) {
                    layers[currentLayer].classList.add('layer-error');

                    if (result.errorType === 'routing' || result.errorType === 'collision') {
                        transmissionFailed = true;
                    }
                }

                setTimeout(() => {
                    layers[currentLayer].classList.remove('active');
                    currentLayer++;
                    processLayer();
                }, 1500);

            } else {
                setTimeout(() => {
                    this.showTransmissionResult(currentMessage, messageCorrupted, transmissionFailed);

                    // Clear layers
                    layers.forEach(layer => {
                        layer.querySelector('.layer-content').textContent = '';
                        layer.classList.remove('layer-error');
                    });
                }, 500);
            }
        };

        processLayer();
    }

    showTransmissionResult(finalMessage, corrupted, failed) {
        if (failed) {
            alert('❌ TRANSMISSION FAILED!\n\nThe packet could not reach its destination due to network errors.\nCheck the layer contents to see what went wrong.');
        } else if (corrupted) {
            alert('⚠️ MESSAGE DELIVERED WITH ERRORS!\n\nThe message arrived but was corrupted during transmission:\n' + finalMessage + '\n\nIn real networks, this would trigger retransmission.');
        } else {
            alert('✅ MESSAGE SENT SUCCESSFULLY!\n\nReceived packet: ' + finalMessage);
        }
    }

    // Pipeline Builder
    initPipelineBuilder() {
        const instructionList = document.getElementById('instruction-list');
        const executePipelineBtn = document.getElementById('execute-pipeline');
        const pipelineTimeline = document.getElementById('pipeline-timeline');
        const enableForwarding = document.getElementById('enable-forwarding');
        const enableBranchPrediction = document.getElementById('enable-branch-prediction');
        const outOfOrder = document.getElementById('out-of-order');

        executePipelineBtn.addEventListener('click', () => {
            const instructions = instructionList.value.trim().split('\n').filter(instr => instr.trim());
            if (instructions.length > 0) {
                this.executePipeline(
                    instructions,
                    pipelineTimeline,
                    enableForwarding.checked,
                    enableBranchPrediction.checked,
                    outOfOrder.checked
                );
            } else {
                alert('Please enter some instructions!');
            }
        });
    }

    executePipeline(instructions, timeline, forwarding, branchPrediction, outOfOrder) {
        timeline.innerHTML = '';

        const stages = ['fetch', 'decode', 'execute', 'memory', 'writeback'];
        const stageNames = ['F', 'D', 'E', 'M', 'W'];

        // Create instruction rows
        instructions.forEach((instr, instrIndex) => {
            const row = document.createElement('div');
            row.className = 'instruction-row';

            const nameCell = document.createElement('div');
            nameCell.className = 'instruction-name';
            nameCell.textContent = instr.trim();
            row.appendChild(nameCell);

            // Create pipeline cells
            for (let cycle = 0; cycle < instructions.length + 4; cycle++) {
                const cell = document.createElement('div');
                cell.className = 'pipeline-cell';
                row.appendChild(cell);
            }

            timeline.appendChild(row);
        });

        // Simulate pipeline execution
        let cycle = 0;
        const maxCycles = instructions.length + 4;

        const simulateCycle = () => {
            if (cycle < maxCycles) {
                instructions.forEach((instr, instrIndex) => {
                    const row = timeline.children[instrIndex];
                    const cells = Array.from(row.children).slice(1); // Skip instruction name

                    for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
                        const stageCycle = instrIndex + stageIndex;

                        if (stageCycle === cycle && stageCycle < cells.length) {
                            // Check for hazards
                            let isStall = false;

                            if (!forwarding && stageIndex === 2) { // Execute stage
                                // Simulate data hazard
                                if (instrIndex > 0 && Math.random() < 0.3) {
                                    isStall = true;
                                }
                            }

                            const cell = cells[stageCycle];
                            if (isStall) {
                                cell.className = 'pipeline-cell stall';
                                cell.textContent = 'STALL';
                            } else {
                                cell.className = `pipeline-cell ${stages[stageIndex]}`;
                                cell.textContent = stageNames[stageIndex];
                            }
                        }
                    }
                });

                cycle++;
                setTimeout(simulateCycle, 300);
            }
        };

        simulateCycle();
    }

    // Cache Side-Channel Demo
    initSideChannelDemo() {
        const secretDataInput = document.getElementById('secret-data');
        const runVictimBtn = document.getElementById('run-victim');
        const runAttackerBtn = document.getElementById('run-attacker');
        const timingChart = document.getElementById('timing-chart');
        const constantTimeCheckbox = document.getElementById('constant-time');
        const cacheFlushingCheckbox = document.getElementById('cache-flushing');

        this.secretAccessed = [];

        runVictimBtn.addEventListener('click', () => {
            this.runVictimProgram(secretDataInput.value);
        });

        runAttackerBtn.addEventListener('click', () => {
            this.runAttackerProgram(timingChart, constantTimeCheckbox.checked, cacheFlushingCheckbox.checked);
        });
    }

    runVictimProgram(secretData) {
        // Simulate victim accessing secret data
        this.secretAccessed = [];

        for (let i = 0; i < secretData.length; i++) {
            const charCode = secretData.charCodeAt(i);
            // Simulate memory access pattern based on secret character
            this.secretAccessed.push(charCode % 256);
        }

        alert(`Victim program executed. Secret data "${secretData}" accessed in memory.`);
    }

    runAttackerProgram(timingChart, constantTime, cacheFlush) {
        if (this.secretAccessed.length === 0) {
            alert('Please run the victim program first!');
            return;
        }

        timingChart.innerHTML = '<h4>Cache Timing Measurements:</h4>';

        // Simulate timing attack
        for (let i = 0; i < 256; i++) {
            let timing;

            if (constantTime || cacheFlush) {
                // Mitigation applied - uniform timing
                timing = 100 + Math.random() * 20;
            } else {
                // Check if this memory location was accessed by victim
                const wasAccessed = this.secretAccessed.includes(i);

                if (wasAccessed) {
                    // Faster access (cache hit)
                    timing = 50 + Math.random() * 20;
                } else {
                    // Slower access (cache miss)
                    timing = 150 + Math.random() * 30;
                }
            }

            // Only show significant timing differences
            if ((!constantTime && !cacheFlush && timing < 80) || Math.random() < 0.05) {
                const bar = document.createElement('div');
                bar.className = `timing-bar ${timing < 80 ? 'fast' : 'slow'}`;
                bar.style.width = `${timing / 2}px`;
                bar.title = `Memory[${i}]: ${timing.toFixed(1)}ms`;

                const label = document.createElement('span');
                label.textContent = `Addr ${i}: ${timing.toFixed(1)}ms`;
                label.style.marginLeft = '10px';

                const container = document.createElement('div');
                container.appendChild(bar);
                container.appendChild(label);

                timingChart.appendChild(container);
            }
        }

        if (!constantTime && !cacheFlush) {
            timingChart.innerHTML += '<p style="color: #e74c3c; font-weight: bold;">⚠️ Secret data leaked through timing differences!</p>';
        } else {
            timingChart.innerHTML += '<p style="color: #27ae60; font-weight: bold;">✓ Mitigations active - timing attack prevented.</p>';
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CSO2Simulations();
});